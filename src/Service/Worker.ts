import Axios from 'axios'
import moment from 'moment'
import { DB } from './DB'

export const runWorker = () => {
  const postToSlack = (serv: any, text: string) => {
    Axios.post('https://slack.com/api/chat.postMessage', {
      channel: serv.plugins.slack.channel,
      username: 'pingpong (down detector)',
      text
    }, {
      headers: { Authorization: serv.plugins.slack.token }
    })
  }

  setInterval(async () => {
    try {
      const services: any[] = DB.service.getData('/services')
      const updated = services.map(async serv => {

        let status: string
        let reason: string
        try {
          const request = await Axios.get(serv.url)
          status = request.status === 200 ? 'up' : 'down'
          if (request.status !== 200) {
            console.error('%j', request.data)
          }
        } catch (error) {
          console.error('%j', error)
          status = 'down'
          reason = error.message
        }

        let currentStats: any = serv.currentStats || undefined
        if (serv.status === 'up' && status === 'down') {
          if (serv.plugins?.slack) {
            postToSlack(serv, `🔥 \`${serv.name}\` DOWN!\n\npingpong can\'t ping ${serv.url}`)
          }
          currentStats = {
            reason,
            downStartedAt: moment().format(),
            downEndedAt: undefined
          }
        } else if (serv.status === 'down' && status === 'up') {
          if (serv.plugins?.slack) {
            postToSlack(serv, `🧯 \`${serv.name}\` recovered!\n\n${serv.url} is down for ${(new Date().getTime() - new Date(currentStats?.downStartedAt).getTime()) / 1000 / 60} minutes`)
          }
          currentStats = {
            ...currentStats,
            downEndedAt: moment().format()
          }
        }
        return {
          ...serv,
          status,
          history: [currentStats, ...serv.history || []].filter(stat => stat?.downEndedAt),
          currentStats: status === 'down' ? currentStats : undefined,
          lastCheck: moment().format()
        }
      })
      DB.service.push('/services', await Promise.all(updated))
    } catch (error) {
      console.error(error)
    }
  }, parseInt(process.env.WORKER_INTERVAL) || 1000)
}