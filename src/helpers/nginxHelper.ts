import ApplicationModel from '../models/application'
import * as Mustache from 'mustache'
import * as fs from 'fs'
import * as path from 'path'
import {exec} from '../lib/shell'

export const updateServers = () => {
    return new Promise(async (resolve,reject)=> {
        // try{    
        //     let applications = await ApplicationModel.find()
        //     let servers = applications.map(item => ({
        //         domain: item.domain,
        //         temp_domain: item.temp_domain,
        //         port:  item.external_port
        //     }))
        //     let templatePath = path.resolve(__dirname,'..','..','services','nginx','nginx.conf.mustache')
        //     let fileOutPath = path.resolve(__dirname,'..','..','services','nginx','nginx.conf')
        //     let templateData = fs.readFileSync(templatePath,'utf8')
        //     let templateRender = Mustache.render(templateData,{servers})
        //     fs.writeFileSync(fileOutPath,templateRender)
        //     await reloadServer()
        //     resolve()
        // }catch(err){
        //     reject(err)
        // }
        resolve()
    })
}

export const reloadServer = () => {
    return new Promise((resolve,reject) => {
        exec('docker container exec proxy_nginx nginx -s reload')
        .then(resp=>{
            resolve()
        })
        .catch(err=>{
            reject('Falha ao reiniciar nginx')
        })
    })
}