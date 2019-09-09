import DockerHelper from './DockerHelper'
import AplicationModel from '../models/application'
import DeployModel from '../models/deploy'
import { logDebug, logFile } from '../lib/logger'
import * as _ from 'lodash'

const build = (application_id: string) => {
  return new Promise(async (resolve, reject) => {
    let deploy = new DeployModel({ aplication_id: application_id })
    try {
      await deploy.save()
      let aplication = await AplicationModel.findById(application_id)
      await DockerHelper.buildImageFromPath(
        aplication.project_path,
        aplication.domain
      )
      let container = await aplication.getOrCreateContainer()
      await DockerHelper.createContainer(container, aplication.auto_deploy)
      Object.assign(deploy, {
        status: 'success',
        message_log: 'Deploy executado com sucesso'
      })
      await deploy.save()
      resolve(container)
    } catch (err) {
      let msg = _.get(err,'message','Falha no build da aplicação')
      deploy.status = 'failure'
      deploy.message_log = msg
      deploy.logs = JSON.stringify(err)
      deploy.save()
      logDebug.error('Falha no build da aplicação', err)
      logFile({
        message: 'Falha no build da aplicação',
        err
      })
      reject('Falha no build da aplicação')
    }
  })
}
const start = (application_id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let aplication = await AplicationModel.findById(application_id).populate({path:'container'})
      if (!aplication.container) {
        reject(
          'O container ainda não foi criado, execute o deploy antes de iniciar a aplicação'
        )
        return
      }
      await DockerHelper.startContainer(aplication.container)
      resolve(aplication.container)
    } catch (err) {
      logDebug.error('Falhao ao iniciar aplicação', err)
      logFile({
        message: 'Falhao ao iniciar aplicação',
        err
      })
      reject('Falhao ao iniciar aplicação')
    }
  })
}
const restart = (application_id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let aplication = await AplicationModel.findById(application_id).populate({path:'container'})
      if (!aplication.container) {
        reject(
          'O container ainda não foi criado, execute o deploy antes de reiniciar a aplicação'
        )
        return
      }
      await DockerHelper.restartContainer(aplication.container)
      resolve(aplication.container)
    } catch (err) {
      logDebug.error('Falha ao reiniciar aplicação', err)
      logFile({
        message: 'Falha ao reiniciar aplicação',
        err
      })
      reject('Falha ao reiniciar aplicação')
    }
  })
}

const stop = (application_id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let aplication = await AplicationModel.findById(application_id).populate({path:'container'})      
      if (!aplication.container) {
        reject(
          'O container ainda não foi criado'
        )
        return
      }      
      await DockerHelper.stopContainer(aplication.container)
      resolve(aplication.container)
    } catch (err) {
      logDebug.error('Falha ao pausar aplicação', err)
      logFile({
        message: 'Falha ao pausar aplicação',
        err
      })
      reject('Falha ao pausar aplicação')
    }
  })
}
const remove = (application_id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let aplication = await AplicationModel.findById(application_id).populate({path:'container'})
      if (!aplication.container) {
        resolve()
        return
      }
      await DockerHelper.removeContainer(
        aplication.container.container_id || aplication.container.container_name
      )
      resolve(aplication.container)
    } catch (err) {
      logDebug.error('Falha ao remover aplicação', err)
      logFile({
        message: 'Falha ao remover aplicação',
        err
      })
      reject('Falha ao remover aplicação')
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
