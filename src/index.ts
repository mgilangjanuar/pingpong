import 'source-map-support/register'

import compression from 'compression'
import express, { Request, Response } from 'express'
import pug from 'pug'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { DB } from './Service/DB'
import { Web } from './Web'
import { runWorker } from './Service/Worker'

// initiate database
DB.init()

// run worker
runWorker()

const app = express()
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('./assets'))
app.use(morgan('combined'))

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
app.engine('pug', pug.__express)
app.set('view engine', 'pug')

app.get('/ping', (_, res) => res.send({ pong: 1 }))
app.use('', Web())

// app.use((e: { status: number, body: object }, _: Request, s: Response) => {
//   // console.log(e)
//   if (e.status && e.body) {
//     return s.status(e.status).send(e.body)
//   } else {
//     return s.status(500).send({ reason: '500 Internal Server Error', error: e.toString() })
//   }
// })

// app.use((_, res: Response, __) => res.status(404).send({ msg: 'No Route Found' }))

app.listen(process.env.PORT || 4001, () => console.log(`Run at http://localhost:${process.env.PORT || 4001} ...`))