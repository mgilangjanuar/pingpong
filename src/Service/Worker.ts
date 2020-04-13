import Axios from 'axios'
import moment from 'moment'
import { DB } from './DB'

export const runWorker = () => {
  setInterval(async () => {
    try {
      const services: any[] = DB.service.getData('/services')
      const updated = services.map(async serv => {

        let status: string
        try {
          const request = await Axios.get(serv.url)
          status = request.status === 200 ? 'up' : 'down'
        } catch (error) {
          status = 'down'
        }

        let currentStats: object = serv.currentStats || undefined
        if (serv.status === 'up' && status === 'down') {
          if (serv.plugins?.slack) {
            Axios.post('https://slack.com/api/chat.postMessage', {
              channel: serv.plugins.slack.channel,
              text: serv.plugins.slack.text,
              username: 'pingpong service'
            }, {
              headers: {
                Authorization: serv.plugins.slack.token
              }
            })
          }
          currentStats = {
            downStartedAt: moment().format(),
            downEndedAt: undefined
          }
        } else if (serv.status === 'down' && status === 'up') {
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
  }, 1000)
}