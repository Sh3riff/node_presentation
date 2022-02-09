import jwt from 'jsonwebtoken'

const tenMinutes = 600
const thirtyDays = 60 * 60 * 24 * 30

export class Token {
  static sign (userId: string) {
    return {
      access: jwt.sign({
        key: userId
      }, process.env.ACCESS_TOKEN_SIGNATURE, { expiresIn: tenMinutes }),
      refresh: jwt.sign({
        key: userId
      }, process.env.REFRESH_TOKEN_SIGNATURE, { expiresIn: thirtyDays })
    }
  }

  static verifyAccess (token: string) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SIGNATURE)
  }

  static verifyRefresh (token: string) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SIGNATURE)
  }
}
