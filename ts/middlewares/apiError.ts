// import {errorLogger} from '../utils'

export const ApiGlobalErrorHandler = (err, req, res, next) => {
  // errorLogger(err)
  if (err instanceof ApiError) {
    res.status(err.code).json({ message: err.message })
    return
  }
  res.status(500).json('internal server error')
  next()
}

export class ApiError {
  // eslint-disable-next-line no-useless-constructor
  constructor (public code: number, public message: string) {}

  static badRequest (msg = 'bad request') {
    return new ApiError(400, msg)
  }

  static unAuthorised (msg = 'Unauthorized') {
    return new ApiError(401, msg)
  }

  static forbidden (msg = 'forbidden') {
    return new ApiError(403, msg)
  }

  static notFound (msg = 'not found') {
    return new ApiError(404, msg)
  }

  static tooManyRequest (msg = 'too many request') {
    return new ApiError(429, msg)
  }

  static internal (msg = 'request failed, try again') {
    return new ApiError(500, msg)
  }
}
