export interface MongooseOptions {
    dbName:string,
    reconnectTries: number,
    reconnectInterval: number,
    socketTimeoutMS: number,
    poolSize: number,
    keepAlive: boolean,
    useCreateIndex: boolean,
    useNewUrlParser: boolean,
    replicaSet: string
}