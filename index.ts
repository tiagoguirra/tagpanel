import Server from './src/server'
import * as path from 'path'

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

Server.init()
