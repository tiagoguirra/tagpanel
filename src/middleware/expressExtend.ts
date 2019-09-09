import * as _ from 'lodash'
import {
  Request,
  Response,
  ResponseHanlder,
  NextFunction,
  ISortPagination,
  IPagination
} from '../interfaces/expressExtend'

export const RequestMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.all = () => {
    return { ...req.body }
  }
  req.input = (name) => {
    return req.body[name]
  }

  req.pagination = (): IPagination => {
    let { page = 1, sortby, perpage = 20 } = req.query
    let [column = 'createdAt', order = 'true'] = sortby?sortby.split(','):[]
    perpage = Number(perpage) || 20
    let limit: number = Number(perpage * 1 || 20)
    let offset: number = ((page * 1 || 1) - 1) * limit
    let orderSort = String(order) === 'true' ? 1 : -1
    let sort: ISortPagination = { [column]: orderSort }
    return { limit, offset, sort }
  }
  next()
}

export const ResponseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.success = (
    message: string,
    data: object = null,
    status: number = 200
  ): ResponseHanlder => {
    return res.status(status).json({
      success: false,
      message,
      data
    })
  }

  res.error = (
    message: string,
    error: object = {},
    status: number = 400
  ): ResponseHanlder => {
    return res.status(status).json({
      success: false,
      message,
      data: transformError(error)
    })
  }

  next()
}

const transformError = (err: any) => {
  let result = {}

  if (err.errors) {
    for (var field in err.errors) {
      if (err.errors[field].name === 'ValidatorError')
        result[field] = err.errors[field].message
    }
  } else if (
    err.name &&
    err.name === 'MongoError' &&
    err.code &&
    err.code === 11000
  ) {
    let msg = _.get(err, 'errmsg', ''),
      indexName = msg.match('index: (.*) dup key:')[1]

    result = `error.duplicateKey.${indexName}`
  } else if (err.name && err.name === 'FieldValidationError') {
    result[err.field] = err.message
  } else {
    result = err
  }

  return result
}
