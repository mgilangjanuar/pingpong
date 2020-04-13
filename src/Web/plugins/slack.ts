import { Router, Request, Response } from 'express'
import { DB } from '../../Service/DB'

export const SlackPlugin = () => {
  const router = Router()

  router.route('/:index/install')
    .get((req: Request, res: Response) => {
      const { index } = req.params
      const service = DB.service.getData(`/services[${index}]`)
      return res.render('plugins/slack/install', {
        _title: 'Install Slack',
        slack: service.plugins?.slack,
        index
      })
    })
    .post((req: Request, res: Response) => {
      const { token, channel } = req.body
      const { index } = req.params
      DB.service.push(`/services[${index}]/plugins/slack`, {
        token, channel
      })
      return res.redirect(`/get/${index}`)
    })

  router.get('/:index/uninstall', (req: Request, res: Response) => {
    const { index } = req.params
    const service = DB.service.getData(`/services[${index}]`)
    DB.service.push(`/services[${index}]`, {
      ...service,
      plugins: {
        ...service.plugins,
        slack: undefined
      }
    })
    return res.redirect(`/get/${index}`)
  })

  return router
}
