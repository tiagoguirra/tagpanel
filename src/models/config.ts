import { Schema, model, Document } from 'mongoose'

export const ConfigSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    },
    required: [true, 'O nome da configuração é obrigatória']
  },
  value:{
      type: String      
  },
  values:{
      type: Object
  }
})

ConfigSchema.set('timestamps', true)
ConfigSchema.set('toObject', { virtuals: true })
ConfigSchema.set('toJSON', { virtuals: true })

export interface IConfig extends Document{
    name: string,
    value?: string,
    values?: any    
}

export default model<IConfig>('config',ConfigSchema)
