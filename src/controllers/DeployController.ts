import {
  Request,
  Response,
  ResponseHanlder,
  IPagination
} from '../interfaces/expressExtend'
import DeployModel from '../models/deploy'
import {logDebug} from '../lib/logger'

class DeployControler {
  async list(req: Request, res: Response): Promise<ResponseHanlder> {
    try {
      let { limit, offset, sort }: IPagination = req.pagination()
      let query = {aplication_id: req.aplication.id}
      let deploy = await DeployModel.find(query)
        .skip(offset)
        .limit(limit)
        .sort(sort)
      let count = await DeployModel.countDocuments(query)
      return res.success('Ok', { deploy, count })
    } catch (err) {
      logDebug.error('Falha ao listar deploys', err)
      return res.error('Falha ao listar deploys', err)
    }
  }  
  async show(req: Request, res: Response): Promise<ResponseHanlder> {
      try{
        //@ts-ignore
        let data = await DeployModel.findById(req.params.id)
        if(data){
            return res.success('Ok',{deploy: data})
        }
        logDebug.error('Deploy não encontrado',{},404)
        return res.error('Deploy não encontrado',{},404)
      }catch(err){
          logDebug.error('Falha ao buscar deploy',err)
          return res.error('Falha ao buscar deploy',err)
      }
  }
  async build(req: Request, res: Response): Promise<ResponseHanlder> {
    try {                  
      global.events.emit('buildAplication',req.aplication.id)
      return res.success('Deploy da aplicação iniciado')
    } catch (err) {
      logDebug.error('Falha ao iniciar deploy da aplicação', err)
      return res.error('Falha ao iniciar deploy da  aplicação', err)
    }
  }
  async start(req: Request, res: Response): Promise<ResponseHanlder> {
    try {          
      global.events.emit('startAplication',req.aplication.id)
      return res.success('Iniciando aplicação')
    } catch (err) {
      logDebug.error('Falha ao inicializar aplicação', err)
      return res.error('Falha ao inicializar aplicação', err)
    }
  }
  async restart(req: Request, res: Response): Promise<ResponseHanlder> {
    try {      
      global.events.emit('restartAplication',req.aplication.id)
      return res.success('Reiniciando aplicação')
    } catch (err) {
      logDebug.error('Falha ao reinicializar aplicação', err)
      return res.error('Falha ao reinicializar aplicação', err)
    }
  }
  async stop(req: Request, res: Response): Promise<ResponseHanlder> {
    try {      
      global.events.emit('stopAplication',req.aplication.id)
      return res.success('Pausando aplicação')
    } catch (err) {
      logDebug.error('Falha ao Pausando aplicação', err)
      return res.error('Falha ao Pausando aplicação', err)
    }
  }
}

export default new DeployControler()
