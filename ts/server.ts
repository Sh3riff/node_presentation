// import path from 'path'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import mongoose from 'mongoose'
// import swaggerUi from 'swagger-ui-express'
// import YAML from 'yamljs'
import { ApiGlobalErrorHandler } from './middlewares'
// import {errorLogger} from './utils'
import { authRoute} from './routes'

dotenv.config()

// const swaggerDocs = YAML.load(path.resolve(__dirname, '../swagger.yaml'))

const app = express()
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use(
//   '/docz-init',
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocs, { explorer: true })
// )
app.use('/auth', authRoute)

// routes below ths Middleware are Authenticated
// app.use(AuthMiddleware)

app.use(ApiGlobalErrorHandler)

app.listen(process.env.PORT || 5000, async () => {
  try {
    await mongoose.connect(process.env.MongoDB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    return console.log('server connected')
  } catch (error) {
    // errorLogger(error)
    console.error('error connecting to DB')
  }
})

