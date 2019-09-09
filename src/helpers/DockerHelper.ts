const Docker = require('dockerode')
import { logDebug, logFile } from '../lib/logger'
import { IDockerContainer } from '../models/dockercontainer'
import DockerLogModel from '../models/dockerlog'
import * as _ from 'lodash'

const docker = new Docker({socketPath: '/var/run/docker.sock'})

const getImage = (imageId: string): Promise<{status:any,image: any}> => {
  return new Promise((resolve, reject) => {
    let image = docker.getImage(imageId)
    image
      .inspect()
      .then((status) => {
        logDebug.debug('Imagem encontrada', imageId)
        resolve({ status, image })
      })
      .catch((err) => {
        logDebug.error('Imagem não encontrada', imageId)
        reject(err)
      })
  })
}

const getContainer = (containerId: string):Promise<{status:any,status_name:string,container: any}> => {
  return new Promise((resolve, reject) => {
    let container = docker.getContainer(containerId)
    container
      .inspect()
      .then((status) => {
        logDebug.debug('container encontrado', containerId)
        let status_name = status['State']['Status']        
        resolve({ status, status_name, container })
      })
      .catch((err) => {
        logDebug.debug('Container não encontrado', containerId)
        reject(err)
      })
  })
}

const removeContainer = (containerId: string, force: boolean = false): Promise<void> => {
  return new Promise((resolve, reject) => {
    getContainer(containerId)
      .then(({ status, container }) => {
        logDebug.debug(`Removendo container '${containerId}'`)
        container
          .remove({ force })
          .then(() => {
            logDebug.debug(`Container '${containerId}' removido`)
            resolve()
          })
          .catch((err) => {
            logDebug.error(`Falha ao remover container '${containerId}'`)
            logFile({
              message: `Falha ao remover container '${containerId}'`,
              err
            })
            reject(err)
          })
      })
      .catch((err) => {
        logDebug.debug(`Container '${containerId}' não encontrado`, err)
        resolve()
      })
  })
}

const waitStream = (stream): Promise<any> => {
  return new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, res) =>
      err ? reject(err) : resolve(res)
    )
  })
}
const buildImageFromPath = (path: string, name: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    logDebug.debug('Buildando imagem')
    docker
      .buildImage(
        {
          context: path,
          src: ['.']
        },
        { t: name }
      )
      .then((stream) => waitStream(stream))
      .then(async (srdout) => {
        logDebug.debug(
          `A imagem '${name}' foi buildada a partir do diretório '${path}'`
        )
        resolve(srdout)
      })
      .catch((err) => {
        logDebug.error(
          `Falha ao buildar imagem '${name}' a partir do diretório '${path}'`
        )
        logFile({
          message: `Falha ao buildar imagem '${name}' a partir do diretório '${path}'`,
          err
        })
        reject(err)
      })
  })
}

const createContainer = (
  _container: IDockerContainer,
  start: boolean = true
):Promise<{status_name:string,container: any, status: any}> => {
  return new Promise((resolve, reject) => {
    removeContainer(_container.container_name)
      .then(() => {
        logDebug.debug(`Criando container ${_container.container_name}`)
        docker
          .createContainer({
            ..._container.normalizeOptions(),
            Tty: true
          })
          .then((container) => {                   
            _container.container_id = _.get(container,'id',null)    
            if (start) {
              return startContainer(_container)
            } else {
              return getContainer(_container.container_id || _container.container_name)
            }
          })
          .then(({ container, status, status_name }) => {            
            logDebug.debug(`Container ${_container.container_name} criado`)
            saveLog(_container, 'createContainer', 'success', 'Container criado')
            if(!start){
              updateStatus(_container,status_name,status)
            }            
            resolve({ container, status, status_name })
          })
          .catch((err) => {
            logDebug.error(
              `Erro ao criar container ${_container.container_name}`
            )
            logFile({
              message: `Erro ao criar container ${_container.container_name}`,
              err
            })
            saveLog(
              _container,
              'createContainer',
              'failure',
              'Falha ao criar container'
            )
            reject(err)
          })
      })
      .catch((err) => {
        logDebug.error(`Erro ao recriar container ${_container.container_name}`)
        logFile({
          message: `Erro ao recriar container ${_container.container_name}`,
          err
        })
        saveLog(
          _container,
          'createContainer',
          'failure',
          'Falha ao recriar container'
        )
        reject(err)
      })
  })
}

const startContainer = (_container: IDockerContainer):Promise<{status_name:string,container: any,status: any}> => {
  return new Promise((resolve, reject) => {
    getContainer(_container.container_id || _container.container_name)
      .then(async ({ status, status_name, container }) => {
        logDebug.debug(
          `Status atual do container ${
            _container.container_name
          }: ${status_name}`
        )
        switch (status_name) {
          case 'running':
            logDebug.debug(
              `O container ${_container.container_name} já está em execução`
            )
            break
          case 'restarting':
            logDebug.debug(
              `O container ${_container.container_name} está em reinicialização`
            )
            break
          default:
            logDebug.debug(`iniciando container ${_container.container_name}`)
            await container.start()
            break
        }
        return { container, status, status_name }
      })
      .then(({container})=>getContainer(_container.container_id || _container.container_name))
      .then(({ container,status, status_name }) => {
        logDebug.debug(
          `O container ${_container.container_name} foi inicializado`
        )
        saveLog(
          _container,
          'startContainer',
          'success',
          'Container inicializado'
        )
        updateStatus(_container,status_name,status)
        resolve({ container, status_name, status })
      })
      .catch((err) => {
        logDebug.error(
          `Falha ao iniciar container ${_container.container_name}`,
          err
        )
        logFile({
          message: `Falha ao iniciar container ${_container.container_name}`,
          err
        })
        saveLog(
          _container,
          'startContainer',
          'failure',
          'Falha ao inicializar container'
        )
        reject(err)
      })
  })
}

const restartContainer = (_container: IDockerContainer):Promise<{status_name:string,container: any, status: any}> => {
  return new Promise((resolve, reject) => {
    getContainer(_container.container_id || _container.container_name)
      .then(async ({ status, status_name, container }) => {
        logDebug.debug(
          `Status atual do container ${
            _container.container_name
          }: ${status_name}`
        )
        switch (status_name) {
          case 'running':
            logDebug.debug(`Reiniciando container ${_container.container_name}`)
            await container.restart()
            break
          case 'restarting':
            logDebug.debug(
              `O container ${_container.container_name} já está sendo reiniciado`
            )
            break
          default:
            logDebug.debug(
              `O container ${
                _container.container_name
              } não está executando, vamos inicia-lo agora`
            )
            await container.start()
            break
        }
        return { container, status_name }
      })
      .then(({container})=>getContainer(_container.container_id || _container.container_name))
      .then(({ container,status, status_name }) => {
        logDebug.debug(
          `O container ${_container.container_name} foi reinicializado`
        )
        saveLog(
          _container,
          'restartContainer',
          'success',
          'Container reinicializado'
        )
        updateStatus(_container,status_name,status)
        resolve({ container, status, status_name })
      })
      .catch((err) => {
        logDebug.error(
          `Falha ao reiniciar container ${_container.container_name}`,
          err
        )
        logFile({
          message: `Falha ao reiniciar container ${_container.container_name}`,
          err
        })
        saveLog(
          _container,
          'restartContainer',
          'failure',
          'Falha ao reinicializar container'
        )
        reject(err)
      })
  })
}

const stopContainer = (_container: IDockerContainer):Promise<{status_name:string,container: any, status: any}> => {
  return new Promise((resolve, reject) => {
    getContainer(_container.container_id || _container.container_name)
      .then(async ({ status, status_name, container }) => {
        logDebug.debug(
          `Status atual do container ${
            _container.container_name
          }: ${status_name}`
        )
        switch (status_name) {
          case 'paused':
          case 'created':
          case 'exited':
          case 'dead':
          case 'removing':
            logDebug.debug(
              `O container ${_container.container_name} já esta pausado`
            )
            break
          default:
            logDebug.debug(
              `Pausando execução do container ${_container.container_name}`
            )
            await container.stop()
            break
        }
        return { container, status_name }
      })
      .then(({container})=>getContainer(_container.container_id || _container.container_name))
      .then(({ container,status, status_name }) => {
        logDebug.debug(`Container ${_container.container_name} pausado`)
        saveLog(_container, 'stopContainer', 'success', 'Container pausado')
        updateStatus(_container,status_name,status)
        resolve({ container, status, status_name })
      })
      .catch((err) => {
        logDebug.error(
          `Falha ao pausar container ${_container.container_name}`,
          err
        )
        saveLog(
          _container,
          'stopContainer',
          'failure',
          'Falha ao pausar container'
        )
        logFile({
          message: `Falha ao pausar container ${_container.container_name}`,
          err
        })
        reject(err)
      })
  })
}

const saveLog = async (
  _container: IDockerContainer,
  operation: string,
  status: string,
  message: string,
  log?: string,
  stdout?: string,
  stdin?: string
) => {
  try {
    let instance = new DockerLogModel({
      container_id: _container.id,
      operation,
      status,
      message,
      log,
      stdout,
      stdin
    })
    await instance.save()
  } catch (err) {
    logDebug.error('Falha ao salvar log de execução', err)
    logFile({
      message: 'Falha ao salvar log de execução',
      err
    })
  }
}

const updateStatus = async (_container: IDockerContainer, status_name: string, status: any) => {
  try {
    _container.status = status_name
    _container.container_id = _.get(status,'Id',null)    
    _container.image_id = _.get(status,'Image',null)    
      await _container.save()
  } catch (err) {
    logDebug.error('Falha ao salvar status do container', err)
    logFile({
      message: 'Falha ao salvar status do container',
      err
    })
  }
}

export {
    getImage,
    getContainer,
    removeContainer,
    buildImageFromPath,
    createContainer,
    startContainer,
    restartContainer,
    stopContainer
}

export default {
    getImage,
    getContainer,
    removeContainer,
    buildImageFromPath,
    createContainer,
    startContainer,
    restartContainer,
    stopContainer
}