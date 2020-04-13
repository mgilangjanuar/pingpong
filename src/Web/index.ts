import { Request, Response, Router } from 'express'
import pidusage from 'pidusage'
import { DB } from '../Service/DB'

export const Web = () => {
  const router = Router()

  router.get('/', async (_: Request, res: Response) => {
    const services = DB.service.getData('/services')
    // const memoryUsed = process.memoryUsage().heapUsed / 1024
    // const memoryTotal = process.memoryUsage().heapTotal / 1024
    const usage = await pidusage(process.pid)
    return res.render('index', {
      _title: 'Index',
      services,
      usage
      // memoryUsed: Math.round(memoryUsed * 100) / 100,
      // memoryTotal: Math.round(memoryTotal * 100) / 100,
      // memoryPercent: Math.round(memoryUsed / memoryTotal * 10000 / 100),
    })
  })

  router.route('/get/:index')
    .get((req: Request, res: Response) => {
      const { index } = req.params
      const service = DB.service.getData(`/services[${index}]`)
      return res.render('detail', {
        _title: 'Detail',
        index,
        service
      })
    })
    .post((req: Request, res: Response) => {
      const { index } = req.params
      const { service } = req.body
      try {
        const services: any[] = DB.service.getData('/services')
        if (services.find((s: any) => s.url === service)) {
          return res.render('detail', {
            _title: 'Detail',
            _error: 'URL service already exists!',
            index,
            service: services[index],
          })
        }
      } catch (error) {
        // ignore when data not found
      }

      DB.service.push(`/services[${index}]`, { url: service, history: [] })
      return res.redirect(`/get/${index}`)
    })

  router.route('/add')
    .get((_: Request, res: Response) => {
      return res.render('add', {
        _title: 'Add service'
      })
    })
    .post((req: Request, res: Response) => {
      const { service } = req.body
      try {
        const services: any[] = DB.service.getData('/services')
        if (services.find((s: any) => s.url === service)) {
          return res.render('add', {
            _title: 'Add service',
            _service: service,
            _error: 'URL service already exists!'
          })
        }
      } catch (error) {
        // ignore when data not found
      }

      DB.service.push('/services[]', { url: service, history: [] })
      return res.redirect('/')
    })

  router.get('/delete/:index', (req: Request, res: Response) => {
    const { index } = req.params
    DB.service.delete(`/services[${index}]`)
    return res.redirect('/')
  })

  return router
}
