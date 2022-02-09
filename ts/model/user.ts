import { Schema, model } from 'mongoose'

interface User {
    _id?: string,
    firstName: string,
    lastName: string,
    email: string,
    pictureUrl?: string,
    stores: string[],
    dateCreated: Date,
    lastSecurityRefresh: Date,
    devices: {
        type: 'mobile' | 'web',
        uniqueId: string,
        ipAddress: string,
        brand?: string, // mobile
        model?: string, // mobile
        os?: string, // mobile & web
        version?: string // mobile
        browser?: string, // web
        refreshToken?: string,
        lastRefreshed?: Date;
        verification: '' | {
        code: string,
        expires: Date
        }
    }[]
}

const schema = new Schema<User>({
  firstName: String,
  lastName: String,
  email: String,
  picture: String,
  stores: Array,
  dateCreated: Date,
  lastSecurityRefresh: Date,
  devices: Array
})

export const UserModel = model<User>('User', schema)
