import {diskStorage} from 'multer';
import * as path from 'path';
import * as uuidv4 from 'uuid/v4'

export const stoagePath = path.resolve(__dirname, '..', '..', 'uploads')
export const stoageResizedPath = path.resolve(stoagePath, 'resized')

export const configUpload = {
  storage: new diskStorage({
    destination: stoagePath,
    filename: function (req, file, cb) {      
      cb(null, uuidv4() + '.jpg')
    }
  })
};

export default configUpload;
