import * as  EventEmmiter from 'events'

declare global {
  namespace NodeJS {
    interface Global {
      events: EventEmmiter
    }
  }
}
global.events = new EventEmmiter()
const event = global.events
import DeployHelper from './helpers/DeployHelper'
import ServiceHelper from './helpers/ServicesHelper'

event.on('startAplication',DeployHelper.start)
event.on('restartAplication',DeployHelper.restart)
event.on('stopAplication',DeployHelper.stop)
event.on('removeAplication',DeployHelper.remove)
event.on('buildAplication',DeployHelper.build)

event.on('startService',ServiceHelper.start)
event.on('restartService',ServiceHelper.restart)
event.on('stopService',ServiceHelper.stop)
event.on('removeService',ServiceHelper.remove)
event.on('buildService',ServiceHelper.build)
