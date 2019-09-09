import * as fs from 'fs'
import * as fse from 'fs-extra'
import * as path from 'path'
import * as tracer from 'tracer'
import * as colors from 'colors'

export const logDebug = tracer.console({
  level: 'log',
  format: [
    '{{timestamp}} [{{title}}] ({{file}}:{{line}}) {{message}} ',
    {
      error:
        '{{timestamp}} [{{title}}] ({{file}}:{{line}}) {{message}}\nCall Stack:\n{{stack}}'
    }
  ],
  filters: {
    log: colors.cyan,
    trace: colors.magenta,
    debug: colors.yellow,
    info: colors.blue,
    warn: colors.yellow.bgBlue,
    error: colors.red
  }
})

export const logFile =  (data: string | object) => {
  if (typeof data == 'string') {
    return saveLog(data)
  } else if (typeof data == 'object') {
    return saveLog(JSON.stringify(data))
  } else {
    return 'data_to_log_invalid'
  }
}

const saveLog = (data: string) => {
  try {
    let pathLog =  process.env.LOG_PATH || path.resolve(__dirname, '..', '..', 'logs')
    let pathLogFile = path.resolve(pathLog, `${new Date().getTime()}.log`)
    fse.ensureDirSync(pathLog)
    fs.writeFileSync(pathLogFile, data)
    return pathLogFile
  } catch (err) {
    console.log('Falha ao gerar log', err)
    return 'log_failure'
  }
}
