import 'source-map-support/register'
require('dotenv').config({ path: '.env' })

import compression from 'compression'
import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { DB } from './Service/DB'
import { Web } from './Web'
import { runWorker } from './Service/Worker'
import { SlackPlugin } from './Web/plugins/slack'

// initiate database
DB.init()

const app = express()
app.set('view engine', 'pug')

app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('./assets'))
app.use(morgan('combined'))

app.get('/ping', (_, res) => res.send({ pong: 1 }))
app.use('', Web())
app.use('/slack', SlackPlugin())

app.listen(process.env.PORT || 4001, () => console.log(`Run at http://localhost:${process.env.PORT || 4001} ...`))

// run worker
runWorker()