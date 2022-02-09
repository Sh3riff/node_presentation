import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

export const sesClient = async (to, subject, body) => {
  const client = new SESClient({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    },
    region: process.env.AWS_REGION
  })

  try {
    const mailData = await client.send(new SendEmailCommand({
      Source: process.env.EMAIL_ADDRESS,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        },
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: body
          },
          Html: {
            Charset: 'UTF-8',
            Data: body
          }
        }
      }
    }))
    return mailData
  } catch (error) {
    console.log(error)
  }
}
export class Sendmail {
  static verify (email, firstName, code) {
    sesClient(email, 'email verification', `hi ${firstName}, Click on <a ${process.env.WEB_DOMAIN}/verify/${code}">Verify</a> to verify your email`)
  }

  static security (email, firstName) {
    sesClient(email, 'Security concern', `hi ${firstName}, we noticed some security inconsistency ...`)
  }
}
