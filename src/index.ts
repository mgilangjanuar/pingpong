import 'source-map-support/register'
import express from 'express'

const app = express()
app.get('/ping', (_, res) => res.send({ pong: 1 }))

app.listen(4001, () => console.log('Run at http://localhost:4001...'))