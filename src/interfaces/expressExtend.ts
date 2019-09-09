import {
  Request as expressRequest,
  Response as expressResponse,
  NextFunction as expressNextFunction
} from 'express'
import { InputFile } from './fileUpload'
import {IAplication} from '../models/application'

export interface Request extends expressRequest {
  all(): any
  input(name: string): object | string | number | any
  pagination(): IPagination
  file?: InputFile
  files?: InputFile[],
  aplication?: IAplication
}

export interface Response extends expressResponse {
  success(message: string, data?: object, status?: number): expressResponse
  error(message: string, data?: object, status?: number): expressResponse
}

export interface ResponseHanlder extends expressResponse {}
export interface NextFunction extends expressNextFunction {}

export interface ISortPagination {
  [column: string]: number  
}
export interface IPagination {
  limit: number,
  offset: number,
  sort?: ISortPagination
}
