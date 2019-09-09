import { Schema, model, Document } from 'mongoose'
import PortHelper from '../helpers/PortHelper'
import DockerContainer, { IDockerContainer } from './dockercontainer'
import * as path from 'path'
import * as passGenerator from 'password-generator'

export const AplicationSchema: Schema = new Schema({
  domain: {
    type: String,
    index: {
      unique: true
    },
    required: [true, 'O dominio é obrigatório']
  },
  temp_domain: {
    type: String,
    index: {
      unique: true
    }
  },
  description: String,
  external_port: Number,
  internal_port: {
    type: Number,
    default: 3000
  },
  command: {
    type: String,
    required: [true, 'O comando de execução é obrigatório']
  },
  envoriment_variables: [String],
  local_path: String,
  git_path: String,
  project_path: String,
  volumes: [
    {
      path: String,
      to: String
    }
  ],
  container_id: {
    type: Schema.Types.ObjectId,
    ref: 'docker-container'
  },
  auto_deploy: {
    type: Boolean,
    default: true
  }
})

AplicationSchema.set('timestamps', true)
AplicationSchema.set('toObject', { virtuals: true })
AplicationSchema.set('toJSON', { virtuals: true })
AplicationSchema.virtual('container', {
  ref: 'docker-container',
  localField: 'container_id',
  foreignField: '_id',
  justOne:true
})
AplicationSchema.pre('save', async function(next) {
  let port = await PortHelper()
  if (port == 0) {
    throw new Error('Não foi possivel definir a port da aplicação')
  }
  let normalizeDomain = this['domain'].replace(/[\W_]+/g, '')
  let projectPath = `/home/tagpanel/applications/${normalizeDomain}`
  this['local_path'] = projectPath
  this['temp_domain'] = passGenerator(5)
  this['external_port'] = port
  this['git_path'] = path.resolve(projectPath, 'git')
  this['project_path'] = path.resolve(projectPath, 'www')
  this['volumes'] = [{path:path.resolve(projectPath, 'volume'),to:'/storage'}]
  next()
})
AplicationSchema.methods.getOrCreateContainer = function(): Promise<
  IDockerContainer
> {
  return new Promise(async (resolve, reject) => {
    try {
      let container: IDockerContainer
      if (this.container_id) {
        container = await DockerContainer.findById(this.container_id)        
        if (container) {
          Object.assign(container, {
            ExposedPorts: {
              [`${this['external_port']}/tcp`]: {}
            },
            Env: this['envoriment_variables'],
            _volumes: this['volumes'],
            HostConfig: {
              PortBindings: {
                [`${this['external_port']}/tcp`]: [
                  {
                    HostPort: `${this['internal_port']}`,
                    HostIp: '0.0.0.0'
                  }
                ]
              }
            }
          })
          await container.save()
          resolve(container)
          return
        }
      }
      container = new DockerContainer({
        container_name: this['domain'],
        image_name: this['domain'],
        image_type: 'frompath',
        ExposedPorts: {
          [`${this['external_port']}/tcp`]: {}
        },
        Env: this['envoriment_variables'],
        _volumes: this['volumes'],
        HostConfig: {
          PortBindings: {
            [`${this['external_port']}/tcp`]: [
              {
                HostPort: `${this['external_port']}`,
                HostIp: '0.0.0.0'
              }
            ]
          }
        }
      })      
      await container.save()
      this.container_id = container.id
      await this.save()
      resolve(container)
    } catch (err) {
      reject({ message: 'Falha ao criar instancia container docker', err })
    }
  })
}
export default model<IAplication>('application', AplicationSchema)
export interface IAplication extends Document {
  domain: string
  temp_domain: string
  description?: string
  envoriment_variables?: string
  local_path: string
  external_port: number
  internal_port: number
  command: string
  volumes?: [
    {
      path: string,
      to: string
    }
  ]
  project_path: string
  git_path: string
  container_id: string
  auto_deploy: boolean
  container?: IDockerContainer
  getOrCreateContainer(): Promise<IDockerContainer>
}
