import { Router } from 'express'
import { Request, Response } from './interfaces/expressExtend'
import Middlewares from './middleware'
import Controllers from './controllers'

const routes = Router()

// middlewares globais
routes.use('/', Middlewares.RequestMiddleware)
routes.use('/', Middlewares.ResponseMiddleware)

//rota padrão
routes.get('/', (req: Request, res: Response) => {
  res.status(200).send({ ok: true })
})

//aplication routes
routes.get('/application', Controllers.Application.list)
routes.get('/application/:id', Controllers.Application.show)
routes.post('/application', Controllers.Application.store)
routes.put('/application/:id', Controllers.Application.update)
routes.delete('/application/:id', Controllers.Application.delete)

//Deploy app
routes.get('/deploy', Middlewares.Aplication, Controllers.Deploy.list)
routes.get('/deploy/:id', Middlewares.Aplication, Controllers.Deploy.show)
routes.post('/deploy/start', Middlewares.Aplication, Controllers.Deploy.start)
routes.post('/deploy/restart', Middlewares.Aplication, Controllers.Deploy.restart)
routes.post('/deploy/stop', Middlewares.Aplication, Controllers.Deploy.stop)
routes.post('/deploy', Middlewares.Aplication, Controllers.Deploy.build)

//config roures
routes.get('/config',Controllers.Config.list)
routes.get('/config/:id',Controllers.Config.show)
routes.post('/config',Controllers.Config.store)
routes.put('/config/:id',Controllers.Config.update)
routes.delete('/config/:id',Controllers.Config.remove)

//services routes
routes.get('/service', Controllers.Service.list)
routes.get('/service/:id', Controllers.Service.show)
routes.post('/service', Controllers.Service.store)
routes.put('/service/:id', Controllers.Service.update)
routes.delete('/service/:id', Controllers.Service.remove)
routes.post('/service/:id/start', Controllers.Service.start)
routes.post('/service/:id/stop', Controllers.Service.stop)
routes.post('/service/:id/restart', Controllers.Service.restart)

export default routes
