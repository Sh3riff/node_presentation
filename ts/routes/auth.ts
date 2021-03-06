import express from 'express'
import { User } from '../model'
import { emailValidator, Date, nanoid, Token, Sendmail } from '../utils'
import { ApiError } from '../middlewares'

const router = express.Router()

const verificationCodeExpiresIn = 15 // minutes

router.post('/signup', async (req, res, next) => {
  let { firstName, lastName, email, deviceInfo } = req.body
  if (!firstName || !lastName || !email || !deviceInfo) {
    return next(ApiError.badRequest('missing required parameters'))
  }
  if (!emailValidator(email)) {
    return next(ApiError.badRequest('invalid email format'))
  }

  firstName = firstName.trim()
  lastName = lastName.trim()
  email = email.trim().toLowerCase()

  try {
    const userExist = await User.exists({ email })
    if (userExist) {
      return next(ApiError.badRequest('email is registered'))
    }
    const code = nanoid()
    const newUser = new User({
      firstName,
      lastName,
      email,
      pictureUrl: '',
      stores: [],
      dateCreated: Date.now(),
      lastSecurityRefresh: Date.now(),
      devices: [{
        ...deviceInfo,
        verification: {
          code,
          expires: Date.addMinutes(verificationCodeExpiresIn)
        }
      }]
    })
    await newUser.save()
    Sendmail.verify(email, firstName, code)
    res.status(201).json({ message: 'account created successfully, kindly check ur email for verification' })
  } catch (error) {
    return next(ApiError.internal())
  }
})

router.post('/login', async (req, res, next) => {
  let { email, deviceInfo } = req.body

  if (!email || !deviceInfo) {
    return next(ApiError.badRequest('missing required parameters'))
  }
  if (!emailValidator(email)) {
    return next(ApiError.badRequest('invalid email format'))
  }

  email = email.trim().toLowerCase()

  try {
    const userExist = await User.findOne({ email }).select('firstName devices').lean()
    if (!userExist) {
      return next(ApiError.notFound('email not found'))
    }
    const isReturningDevice = userExist.devices.find(device => device.uniqueId === deviceInfo.uniqueId)
    const code = nanoid()
    if (!isReturningDevice) {
      const newDevice = {
        ...deviceInfo,
        verification: {
          code,
          expires: Date.addMinutes(verificationCodeExpiresIn)
        }
      }
      await User.findOneAndUpdate({ email }, { $push: { devices: newDevice } }, { new: true }).lean()
      Sendmail.verify(email, userExist.firstName, code)
      res.status(200).json({ message: 'login initialized, kindly check ur email for verification' })
    }
    if (isReturningDevice) {
      const verificationUpdate = {
        code,
        expires: Date.addMinutes(verificationCodeExpiresIn)
      }
      await User.findOneAndUpdate({ email, 'devices.uniqueId': deviceInfo.uniqueId }, { $set: { 'devices.$.verification': verificationUpdate } }, { new: true })
      Sendmail.verify(email, userExist.firstName, code)
      res.status(200).json({ message: 'login initialized, kindly check ur email for verification' })
    }
  } catch (error) {
    return next(ApiError.internal())
  }
})

router.post('/verify', async (req, res, next) => {
  let { email, verificationCode, deviceInfo } = req.body

  if (!email || !verificationCode || !deviceInfo) {
    return next(ApiError.badRequest('missing required parameters'))
  }

  email = email.trim().toLowerCase()
  try {
    const userExist = await User.findOne({ email }).select('devices').lean()
    if (!userExist) {
      return next(ApiError.notFound('email not found'))
    }
    const thisDevice = userExist.devices.find(device => device.uniqueId === deviceInfo.uniqueId)
    if (!thisDevice || !thisDevice.verification) {
      return next(ApiError.badRequest('invalid verification, try again'))
    }
    if (thisDevice.verification.code !== verificationCode) {
      return next(ApiError.badRequest('Invalid verification code'))
    }
    if (!Date.isBeforeNow(thisDevice.verification.expires)) {
      return next(ApiError.badRequest('expired verification code'))
    }
    const token = Token.sign(userExist._id)
    await User.findOneAndUpdate(
      { email, 'devices.uniqueId': deviceInfo.uniqueId },
      { $set: { 'devices.$.verification': '', 'devices.$.refreshToken': token.refresh, 'devices.$.lastRefreshed': Date.now() } },
      { new: true }
    ).lean()
    res.status(200).json({ message: 'user authenticated', token })
  } catch (error) {
    return next(ApiError.internal())
  }
})

router.post('/refresh', async (req, res, next) => {
  const refreshToken = req.headers.authorization
  const deviceInfo = req.body

  if ((typeof refreshToken !== 'string') || !refreshToken || !refreshToken.split(' ')[1] || !deviceInfo) {
    return next(ApiError.unAuthorised())
  }

  try {
    const tokenPayload = await Token.verifyRefresh(refreshToken.split(' ')[1])

    if (typeof tokenPayload === 'string') {
      return next(ApiError.unAuthorised())
    }

    const thisUser = await User.findById(tokenPayload.key).select('devices lastSecurityRefresh email firstName').lean()
    const thisDevice = thisUser.devices.find(device => device.uniqueId === deviceInfo.uniqueId)
    const thisRefreshToken = refreshToken.split(' ')[1]
    const tokenIssuedAt = tokenPayload.iat * 1000 // converting to milliseconds
    const issuedBeforeReset = Date.aIsBeforeB(tokenIssuedAt, thisUser.lastSecurityRefresh)

    if (!thisUser || !thisDevice || !thisDevice.refreshToken || (thisDevice.refreshToken !== thisRefreshToken && issuedBeforeReset)) {
      return next(ApiError.unAuthorised())
    }

    if (thisDevice.refreshToken !== thisRefreshToken && !issuedBeforeReset) {
      await User.findByIdAndUpdate(tokenPayload.key, { $set: { devices: [], lastSecurityRefresh: Date.now() } }).lean()
      Sendmail.security(thisUser.email, thisUser.firstName)
      return next(ApiError.unAuthorised())
    }

    const token = Token.sign(tokenPayload.key)
    await User.findOneAndUpdate(
      { _id: tokenPayload.key, 'devices.uniqueId': thisDevice.uniqueId },
      { $set: { 'devices.$.refreshToken': token.refresh, 'devices.$.lastRefreshed': Date.now() } }
    ).lean()
    res.status(200).json({ message: 'user authenticated', token })
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      console.log('step catch')
      return next(ApiError.unAuthorised())
    }
    return next(ApiError.internal())
  }
})

export default router
