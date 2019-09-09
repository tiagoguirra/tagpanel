import ConfigModel from '../models/config'
import AplicationModel from '../models/application'

export default async () => {
    let portRange = await ConfigModel.findOne({name:'range_port'})
    if(!portRange){
        return 0
    }
    let lastPort = await AplicationModel.findOne().sort({external_port:-1})
    let port = portRange.values.initial

    if(lastPort){
        port = lastPort.external_port + 1
        if( portRange.values.initial <= port && port <= portRange.values.final){
            return port
        }
        return 0
    }
    return port
}