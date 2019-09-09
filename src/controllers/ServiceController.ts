import {
  Request,
  Response,
  ResponseHanlder,
  IPagination
} from '../interfaces/expressExtend'
import { logDebug, logFile } from '../lib/logger'
import ServiceModel from '../models/service'
import { remove as removeService } from '../helpers/ServicesHelper'
import * as _ from 'lodash'

class ServiceController {
  async list(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      let { limit, offset, sort }: IPagination = req.pagination()
      let application = await ServiceModel.find()
        .skip(offset)
        .limit(limit)
        .sort(sort)
      let count = await ServiceModel.countDocuments()
      return res.success('Ok', { application, count })
    } catch (err) {
      logDebug.error('Falha ao listar serviços', err)
      return res.error('Falha ao listar serviços', err)
    }
  }
  async show(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      let service = await ServiceModel.findById(req.params['id'])
      if (!service) {
        return res.error('Serviço não encontrado', null, 404)
      }
      return res.success('Ok', { service })
    } catch (err) {
      logDebug.error('Falha ao buscar serviço', err)
      return res.error('Falha ao buscar serviço', err)
    }
  }
  async store(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      let service = new ServiceModel({ ...req.all() })
      await service.save()
      global.events.emit('buildService',service.id)
      return res.success('Serviço cadastrado com sucesso', { service }, 201)
    } catch (err) {
      logDebug.error('Falha ao cadastrar serviço', err)
      return res.error('Falha ao cadastrar serviço', err)
    }
  }
  async update(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      let service = await ServiceModel.findById(req.params['id'])
      if (!service) {
        return res.error('Serviço não encontrado', null, 404)
      }
      let {
        display_name,
        description,
        envoriment_variables,
        volumes,
        ports,
        network_host,
        network_mode,
        Links
      } = req.all()
      Object.assign(service, {
        display_name,
        description,
        envoriment_variables,
        volumes,
        ports,
        network_host,
        network_mode,
        Links
      })
      await service.save()
      global.events.emit('buildService',service.id)
      return res.success('Serviço atualizado', service)
    } catch (err) {
      logDebug.error('Falha ao atualizar serviço', err)
      return res.error('Falha ao atualizar serviço', err)
    }
  }
  async remove(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      let service = await ServiceModel.findById(req.params['id'])
      if (!service) {
        return res.error('Serviço não encontrado', null, 404)
      }
      await removeService(service.id)
      await service.remove()
      return res.success('Serviço removido com sucesso')
    } catch (err) {
      logDebug.error('Falha ao remover serviço', err)
      return res.error('Falha ao remover serviço', err)
    }
  }
  async start(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      let service = await ServiceModel.findById(req.params['id'])
      if (!service) {
        return res.error('Serviço não encontrado', null, 404)
      }
      global.events.emit('startService',service.id)
      return res.success('O serviço está sendo iniciado')
    } catch (err) {
      logDebug.error('Falha ao iniciar serviço', err)
      return res.error('Falha ao iniciar serviço', err)
    }
  }
  async restart(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      let service = await ServiceModel.findById(req.params['id'])
      if (!service) {
        return res.error('Serviço não encontrado', null, 404)
      }
      global.events.emit('restartService',service.id)
      return res.success('O serviço está sendo reiniciado')
    } catch (err) {
      logDebug.error('Falha ao reiniciar serviço', err)
      return res.error('Falha ao reiniciar serviço', err)
    }
  }
  async stop(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
        let service = await ServiceModel.findById(req.params['id'])
        if (!service) {
          return res.error('Serviço não encontrado', null, 404)
        }
        global.events.emit('stopService',service.id)
        return res.success('O serviço está sendo pausado')
    } catch (err) {
      logDebug.error('Falha ao pausar serviço', err)
      return res.error('Falha ao pausar serviço', err)
    }
  }
}

export default new ServiceController()