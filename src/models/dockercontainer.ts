import { Schema, model, Document } from 'mongoose'
import * as _ from 'lodash'

export const DockerContainerSchema = new Schema({
  container_id: String,
  container_name: {
    type: String,
    required: [true, 'O nome do container é obrigatório']
  },
  image_id: String,
  image_name: {
    type: String,
    required: [true, 'O nome da imagem é obrigatório']
  },
  image_type: {
    type: String,
    required: [true, 'O tipo de imagem é obrigatório']
  },
  status: String,
  _volumes: [
    {
      path: String,
      to: String
    }
  ],
  WorkingDir: String,
  Hostname: String,
  Domainname: String,
  AttachStdin: Boolean,
  AttachStdout: Boolean,
  AttachStderr: Boolean,
  ExposedPorts: Object,
  OpenStdin: Boolean,
  StdinOnce: Boolean,
  Env: [String],
  Cmd: [String],
  Volumes: Object,
  HostConfig: {
    Binds: [String],
    NetworkMode: String,
    PortBindings: Object,
    RestartPolicy: {
      Name: {
        type: String,
        default: 'unless-stopped'
      },
      MaximumRetryCount: {
        type: Number,
        default: 3
      }
    },
    Links: [String]
  }
})
DockerContainerSchema.set('timestamps', true)
DockerContainerSchema.set('toObject', { virtuals: true })
DockerContainerSchema.set('toJSON', { virtuals: true })
DockerContainerSchema.pre('save', function(next) {
  this['container_name'] = this['container_name'].replace(/[\W_]+/g, '')
  this['image_name'] = this['image_name'].replace(/[\W_]+/g, '')
  this['Volumes'] = this['nomalizeVolumes']()
  this['HostConfig']['Binds'] = this['nomalizeBinds']()
  next()
})
DockerContainerSchema.methods.nomalizeVolumes = function() {
  let volumes = {}  
  if (Array.isArray(this._volumes)) {
    this._volumes.map((volume) => {
      volumes[volume.to] = {}
    })
  }
  return volumes
}
DockerContainerSchema.methods.nomalizeBinds = function() {
  if (Array.isArray(this._volumes)) {
    return this._volumes.map((volume) => {
      return `${volume.path}:${volume.to}`
    })
  }
  return []
}
DockerContainerSchema.methods.normalizeOptions = function() {
  let _this = _.cloneDeep(this.toJSON())
  let options = {
    Image: _.clone(_this.image_id || _this.image_name),
    name: _.clone(_this.container_name),
    ..._this,
    Volumes: this.Volumes,
    ExposedPorts: this.ExposedPorts,
  }
  console.log(options)
  return options
}
export default model<IDockerContainer>(
  'docker-container',
  DockerContainerSchema
)
export interface IDockerContainer extends Document {
  container_id?: string
  container_name: string
  image_id?: string
  image_name?: string
  image_type: string
  Hostname?: string
  Domainname?: string
  AttachStdin?: boolean
  AttachStdout?: boolean
  AttachStderr?: boolean
  ExposedPorts?: any
  OpenStdin?: boolean
  StdinOnce?: boolean
  Env?: string[]
  Cmd?: string[]
  Volumes?: any
  status?: string
  _volumes: [
    {
      path: string
      to: string
    }
  ]
  WorkingDir?: string
  HostConfig?: {
    Binds?: string[]
    NetworkMode?: string
    PortBindings?: any
    RestartPolicy?: {
      Name?: string
      MaximumRetryCount?: number
    }
    Links?: string[]
  }
  normalizeOptions(): any
  nomalizeVolumes(): any
  normalizeBinds(): string[]
}
