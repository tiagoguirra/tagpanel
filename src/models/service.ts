import { Schema, model, Document } from 'mongoose'
import DockerContainer, { IDockerContainer } from './dockercontainer'

export const ServicesSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    },
    required: [true, 'O nome do serviço é obrigatório']
  },
  display_name: {
    type: String,
    required: [true, 'O nome do serviço é obrigatório']
  },
  logo: {
    type: String
  },
  description: {
    type: String
  },
  envoriment_variables: [String],
  volumes: [String],
  _volumes: [
    {
      path: String,
      to: String
    }
  ],
  container_name: String,
  container_id: String,
  image_name: String,
  ports: [
    {
      internal: { type: String },
      external: { type: String }
    }
  ],
  network_host: String,
  network_mode: String,
  Links: [String]
})
ServicesSchema.set('timestamps', true)
ServicesSchema.set('toObject', { virtuals: true })
ServicesSchema.set('toJSON', { virtuals: true })
ServicesSchema.pre('save', async function(next) {
  let normalizeName = this['name'].replace(/[\W_]+/g, '')
  this['container_name'] = normalizeName
  if (this['_volumes']) {
    this['volumes'] = this['_volumes'].map((volume) => {
      return {
        path: `/home/services/${normalizeName}/${volume}`,
        to: volume
      }
    })
  }
  next()
})
ServicesSchema.virtual('container', {
  ref: 'docker-container',
  localField: 'container_id',
  foreignField: '_id',
  justOne:true
})
ServicesSchema.methods.normalizePortBindings = function(): object {
  let PortBindings = {}
  if (Array.isArray(this['ports'])) {
    this.ports.map((port) => {
      PortBindings[`${port.external}/tcp`] = [
        {
          HostPort: `${port.internal}`,
          HostIp: '0.0.0.0'
        }
      ]
    })
  }
  return PortBindings
}
ServicesSchema.methods.normalizeExposedPorts = function(): object {
  let ExposedPorts = {}
  if (Array.isArray(this.ports)) {
    this.ports.map((port) => {
      ExposedPorts[`${port.external}/tcp`] = {}
    })
  }
  return ExposedPorts
}
ServicesSchema.methods.getOrCreateContainer = function(): Promise<
  IDockerContainer
> {
  return new Promise(async (resolve, reject) => {
    try {
      let container: IDockerContainer
      if (this['container_id']) {
        await this.populate({path:'container'})
        container = this['container']
        if (container) {
          Object.assign(container, {
            ExposedPorts: this.normalizeExposedPorts(),
            Env: this['envoriment_variables'],
            _volumes: this['volumes'],
            HostConfig: {
              PortBindings: this.normalizePortBindings()
            }
          })
          await container.save()
          resolve(container)
          return
        }
      }
      container = new DockerContainer({
        container_name: this['name'],
        image_name: this['image_name'],
        image_type: 'fromhub',
        ExposedPorts: this.normalizeExposedPorts(),
        Env: this['envoriment_variables'],
        Volumes: this['volumes'],
        HostConfig: {
          PortBindings: this.normalizePortBindings()
        }
      })
      await container.save()
      this['container_id'] = container.id
      await this.save()
      resolve(container)
    } catch (err) {
      reject({ message: 'Falha ao criar instancia container docker', err })
    }
  })
}
export default model<IService>('service', ServicesSchema)

export interface IService extends Document {
  name: string
  display_name: string
  logo?: string
  description?: string
  envoriment_variables?: string
  _volumes: string[]
  volumes?: [
    {
      path: string
      to: string
    }
  ]
  container_name?: string
  container_id?: string
  image_name: string
  ports?: [
    {
      internal: string
      external: string
    }
  ]
  network_host?: string
  network_mode?: string
  Links?: string[]
  container?: IDockerContainer
  normalizePortBindings(): object
  normalizeExposedPorts(): object
  getOrCreateContainer(): Promise<IDockerContainer>
}
