import {
  Request,
  Response,
  ResponseHanlder,
  IPagination
} from '../interfaces/expressExtend'
import ApplicationModel from '../models/application'
import applicationHelper from '../helpers/ApplicationHelper'
import * as  deployHelper from '../helpers/DeployHelper'
import { updateServers } from '../helpers/nginxHelper'
import {logDebug, logFile} from '../lib/logger'
import * as _ from 'lodash'
class ApplicationController {
  async list(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      let { limit, offset, sort }: IPagination = req.pagination()
      let application = await ApplicationModel.find()
        .skip(offset)
        .limit(limit)
        .sort(sort)
      let count = await ApplicationModel.countDocuments()
      return res.success('Ok', { application, count })
    } catch (err) {
      logDebug.error('Falha ao buscas aplicações', err)
      return res.error('Falha ao buscas aplicações', err)
    }
  }
  async store(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      //
      let instance = new ApplicationModel({ ...req.all() })
      await instance.save()
      return applicationHelper.create(instance)        
        .then(() => {
          return res.success('Ok', { data: instance }, 201)
        })
        .catch(async (err) => {
          await instance.remove()
          logDebug.error('Falha ao criar nova aplicação', err)
          return res.error('Falha ao criar nova aplicação', err)
        })
    } catch (err) {
      return res.error('Falha ao criar nova aplicação', err)
    }
  }
  async show(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      //@ts-ignore
      let data = await ApplicationModel.findById(req.params.id)
      if (!data) {
        return res.error('Aplicação não encontrado', {}, 404)
      }
      return res.success('Ok', { data })
    } catch (err) {
      logDebug.error('Falha ao buscar aplicação', err)
      return res.error('Falha ao buscar aplicação', err)
    }
  }
  async update(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      //@ts-ignore
      let data = await ApplicationModel.findById(req.params.id)
      if (!data) {
        return res.error('Aplicação não encontrado',null,404)
      }
      let {
        description,
        internal_port,
        command,
        envoriment_variables
      } = req.all()

      Object.assign(data, {
        description,
        internal_port,
        command,
        envoriment_variables
      })
      await data.save()
      global.events.emit('restartAplication',data.id)
      return res.success('Created', { data }, 201)
    } catch (err) {
      logDebug.error('Falha ao criar nova aplicação', err)
      return res.error('Falha ao criar nova aplicação', err)
    }
  }
  async delete(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      //@ts-ignore
      let data = await ApplicationModel.findById(req.params.id)
      if (!data) {
        return res.error('Aplicação não encontrado',null,404)
      }      
      await deployHelper.remove(data.id)
      await applicationHelper.remove(data)
      await data.remove()      
      updateServers()
      .then(() => {
        logDebug.debug('Nginx atualizado: ' + req.params['id'])
      })
      .catch((err) => {
        let error = _.cloneDeep(err)
        logDebug.error('Falha ao reiniciar nginx: ' +req.params['id'], err)
        logFile({
          message: 'Falha ao reiniciar nginx:' + req.params['id'],
          error
        })
      })
      return res.success('Aplicação removida')
    } catch (err) {
      logDebug.error('Falha ao remover aplicação', err)
      return res.error('Falha ao remover aplicação', err)
    }
  }
}

export default new ApplicationController()
