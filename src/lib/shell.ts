import * as shell from 'shelljs'
import * as path from 'path'

export const exec = (command: string, useDirPath: boolean = false) => {
    return new Promise((resolve,reject)=>{        
        let internalCommand = useDirPath?`cd ${path.resolve(__dirname,'..','..')} && ${command}`: command
        shell.exec(internalCommand,{silent:true},function(code, stdout, stderr){
            if(code !== 0){
                reject({code,stdout})
            }else{
                resolve()
            }
        })
    })
}