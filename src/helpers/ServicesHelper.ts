import DockerHelper from './DockerHelper'
import ServiceModel from '../models/service'
import { logDebug, logFile } from '../lib/logger'
import * as _ from 'lodash'

const build = (service_id: string) => {
  return new Promise(async (resolve, reject) => {
    try {      
      let service = await ServiceModel.findById(service_id)
      let container = await service.getOrCreateContainer()
      let startAfterBuild = false
      try{
        let {status_name} = await DockerHelper.getContainer(_.get(container,'container_id',container.container_name))
        if(status_name != 'running' && status_name != 'restarting' ){
          startAfterBuild = true
        }
      }catch(err){
        startAfterBuild = false
      }

      await DockerHelper.createContainer(container, startAfterBuild)
      resolve(container)
    } catch (err) {
      logDebug.error('Falha no build do servico', err)
      logFile({
        message: 'Falha no build do servico',
        err
      })
      reject('Falha no build do servico')
    }
  })
}
const start = (service_id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let service = await ServiceModel.findById(service_id).populate({
        path: 'container'
      })
      if (!service.container) {
        reject(
          'O container ainda não foi criado, execute o deploy antes de iniciar o serviço'
        )
        return
      }
      await DockerHelper.startContainer(service.container)
      resolve(service.container)
    } catch (err) {
      logDebug.error('Falhao ao iniciar serviço', err)
      logFile({
        message: 'Falhao ao iniciar serviço',
        err
      })
      reject('Falhao ao iniciar serviço')
    }
  })
}
const restart = (service_id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let service = await ServiceModel.findById(service_id).populate({
        path: 'container'
      })
      if (!service.container) {
        reject(
          'O container ainda não foi criado, execute o deploy antes de reiniciar o serviço'
        )
        return
      }
      await DockerHelper.restartContainer(service.container)
      resolve(service.container)
    } catch (err) {
      logDebug.error('Falha ao reiniciar serviço', err)
      logFile({
        message: 'Falha ao reiniciar serviço',
        err
      })
      reject('Falha ao reiniciar serviço')
    }
  })
}

const stop = (service_id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let service = await ServiceModel.findById(service_id).populate({
        path: 'container'
      })
      if (!service.container) {
        reject(
          'O container ainda não foi criado, execute o deploy antes de pausar o serviço'
        )
        return
      }
      await DockerHelper.stopContainer(service.container)
      resolve(service.container)
    } catch (err) {
      logDebug.error('Falha ao pausar serviço', err)
      logFile({
        message: 'Falha ao pausar serviço',
        err
      })
      reject('Falha ao pausar serviço')
    }
  })
}
const remove = (service_id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let service = await ServiceModel.findById(service_id).populate({
        path: 'container'
      })
      if (!service.container) {
        resolve()
        return
      }
      await DockerHelper.removeContainer(
        service.container.container_id || service.container.container_name
      )
      resolve(service.container)
    } catch (err) {
      logDebug.error('Falha ao remover serviço', err)
      logFile({
        message: 'Falha ao remover serviço',
        err
      })
      reject('Falha ao remover serviço')
    }
  })
}

export { build, start, restart, stop, remove }
export default {
  build,
  start,
  restart,
  stop,
  remove
}
