import { Schema, model, Document } from 'mongoose'
import { IAplication } from './application'
import {IDockerContainer} from './dockercontainer'

export const DeploySchema = new Schema({
  aplication_id: {
    type: Schema.Types.ObjectId,
    ref: 'application',
    required: [true, 'Id da aplicação é obrigatório']
  },
  container_id: {
    type: Schema.Types.ObjectId,
    ref: 'docker-container'
  },  
  status: String,
  message_log: {
    type: String,
    default: ''
  },
  logs: {
    type: String,
    default: ''
  }
})
DeploySchema.set('timestamps', true)
DeploySchema.set('toObject', { virtuals: true })
DeploySchema.set('toJSON', { virtuals: true })
DeploySchema.virtual('application', {
  ref: 'application',
  localField: 'aplication_id',
  foreignField: '_id',
  justOne:true
})
DeploySchema.virtual('container', {
  ref: 'docker-container',
  localField: 'container_id',
  foreignField: '_id',
  justOne:true
})

export default model<IDeploy>('deploy', DeploySchema)
export interface IDeploy extends Document {
  aplication_id: string
  application?: IAplication
  container_id: string
  container?: IDockerContainer
  status: string
  logs?: string,
  message_log: string  
}
