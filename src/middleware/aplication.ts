import {
  Request,
  Response,
  ResponseHanlder,
  NextFunction
} from '../interfaces/expressExtend'
import AplicationModel from '../models/application'

export default async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ResponseHanlder> => {
  try {
    let idAplication = req.headers['x-aplication-id'] || null

    if (!idAplication) {
      return res.error('Aplicação não encontrada')
    }
    let data = await AplicationModel.findById(idAplication)
    if (!data) {
      return res.error('Aplicação não encontrada',null,404)
    }
    req.aplication = data
    next()
  } catch (err) {
    return res.error('Falha ao buscar aplicação', err)
  }
}
