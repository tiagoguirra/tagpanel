import { Schema, model, Document } from 'mongoose'

export const DockerLogSchema = new Schema({    
  operation: String,
  status: String,
  message: String,
  log: String,
  stdout: String,
  stdin: String,
  container_id: {
    type: Schema.Types.ObjectId,
    ref: 'docker-container'
  }
})
DockerLogSchema.set('timestamps', true)
DockerLogSchema.set('toObject', { virtuals: true })
DockerLogSchema.set('toJSON', { virtuals: true })
DockerLogSchema.virtual('container', {
  ref: 'docker-container',
  localField: 'container_id',
  foreignField: '_id',
  justOne:true
})
export interface IDockerLog extends Document {
  container_id: string  
  operation: string
  status: string
  message: string
  log: string
  stdout: string
  stdin: string
}
export default model<IDockerLog>('docker-log', DockerLogSchema)
