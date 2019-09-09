import {
  Request,
  Response,
  ResponseHanlder,
  IPagination
} from '../interfaces/expressExtend'

import ConfigModel from '../models/config'
import {logDebug} from '../lib/logger'

class ConfigController {
  async list(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      let { limit, offset, sort }: IPagination = req.pagination()
      let config = await ConfigModel.find()
        .skip(offset)
        .limit(limit)
        .sort(sort)
      let count = await ConfigModel.countDocuments()
      return res.success('Ok', { config, count })
    } catch (err) {
      logDebug.error('Falha ao listar configurações',err)
      return res.error('Falha ao listar configurações',err)
    }
  }
  async show(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      //@ts-ignore
        let config = ConfigModel.findById(req.params.id)
        if(!config){
          return res.error('Configuração não encontrada',null,404)
        }
        return res.success('Ok',{config})
    } catch (err) {
      logDebug.error('Falha ao criar configuração',err)
      return res.error('Falha ao criar configuração',err)
    }
  }
  async store(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
        let config = new ConfigModel({...req.all()})
        await config.save()
        return res.success('Configuração criada',{config},201)
    } catch (err) {
      logDebug.error('Falha ao criar configuração',err)
      return res.error('Falha ao criar configuração',err)
    }
  }
  async update(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      //@ts-ignore
        let config = await ConfigModel.findById(req.params.id)
        if(!config){
          return res.error('Configuração não encontrada',null,404)
        }
        Object.assign(config,{...req.all()})
        await config.save()
        return res.success('Configuração atualizada',{config})
    } catch (err) {
      logDebug.error('Falha ao atualizar configuração',err)
      return res.error('Falha ao atualizar configuração',err)
    }
  }
  async remove(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      //@ts-ignore
        let config = await ConfigModel.findById(req.params.id)
        if(!config){
          return res.error('Configuração não encontrada',null,404)
        }        
        await config.remove()
        return res.success('Configuração removida')
    } catch (err) {
      logDebug.error('Falha ao remover configuração',err)
      return res.error('Falha ao remover configuração',err)
    }
  }
}

export default new ConfigController