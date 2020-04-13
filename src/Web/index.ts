import { Request, Response, Router } from 'express'
import pidusage from 'pidusage'
import { DB } from '../Service/DB'

export const Web = () => {
  const router = Router()

  router.get('/', async (_: Request, res: Response) => {
    let services: any[]
    try {
      services = DB.service.getData('/services')
    } catch (error) {
      services = []
    }
    const usage = await pidusage(process.pid)
    return res.render('basic/index', {
      _title: 'Index',
      services,
      usage
    })
  })

  router.route('/get/:index')
    .get((req: Request, res: Response) => {
      const { index } = req.params
      const service = DB.service.getData(`/services[${index}]`)
      return res.render('basic/detail', {
        _title: 'Detail',
        index,
        service
      })
    })
    .post((req: Request, res: Response) => {
      const { index } = req.params
      const { name, service } = req.body
      DB.service.push(`/services[${index}]`, { name, url: service, history: [] })
      return res.redirect(`/get/${index}`)
    })

  router.route('/add')
    .get((_: Request, res: Response) => {
      return res.render('basic/add', {
        _title: 'Add service'
      })
    })
    .post((req: Request, res: Response) => {
      const { name, service } = req.body
      try {
        const services: any[] = DB.service.getData('/services')
        if (services.find((s: any) => s.url === service)) {
          return res.render('basic/add', {
            _title: 'Add service',
            _name: name,
            _service: service,
            _error: 'URL service already exists!'
          })
        }
      } catch (error) {
        // ignore when data not found
      }

      DB.service.push('/services[]', { name, url: service, history: [] })
      return res.redirect('/')
    })

  router.get('/delete/:index', (req: Request, res: Response) => {
    const { index } = req.params
    DB.service.delete(`/services[${index}]`)
    return res.redirect('/')
  })

  return router
}
