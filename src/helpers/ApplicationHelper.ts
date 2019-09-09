import * as shell from '../lib/shell'
import * as fs from 'fs'
import * as fse from 'fs-extra'
import * as path from 'path'
import { logFile } from '../lib/logger'
import { IAplication } from '../models/application'

const create = (application: IAplication) => {
  return new Promise(async(resolve, reject) => {    
    try{      
      fse.removeSync(application.local_path)
      fse.emptyDirSync(application.local_path)
      fse.emptyDirSync(application.git_path)
      fse.emptyDirSync(application.project_path)
      fse.emptyDirSync(path.resolve(application.local_path,'volume'))
      await shell.exec(`cd ${application.git_path} && git init --bare`)

      let gitScript = `
      #!/bin/bash
      git --work-tree="${application.project_path}" --git-dir="${application.git_path}" checkout -f
      curl -XPOST -H 'x-aplication-id: ${application.id}' 'http://localhost:8000/deploy'
      `
      let hookPath = path.resolve(application.git_path,'hooks')
      let postReceivePath = path.resolve(hookPath,'post-receive')
      fs.writeFileSync(postReceivePath,gitScript)
      await shell.exec(`cd ${hookPath}  && chmod +x post-receive`)
      resolve()
    }catch(err){
      reject({message:'Falha ao criar aplicação'})
    }
  })
}

const remove = (application: IAplication) => {
  return new Promise(async (resolve, reject) => {
    try {
      fse.removeSync(application.local_path)
      resolve()
    } catch (err) {
      reject({ message: 'Falha ao remover aplicação' })
      logFile(err)
    }
  })
}
export default {
  create,
  remove
}