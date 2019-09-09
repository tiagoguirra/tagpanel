import * as express from "express";
import * as http from "http";
import * as io from "socket.io";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as compress from "compression";
import * as responseTime from "response-time";
import * as methodOverride from "method-override";
import * as path from "path";
import * as mongoose from "mongoose";
import { MongooseOptions } from "./interfaces/Mongoose";
import router from "./routes";
import * as allRoutes from "express-list-endpoints";
import {logDebug} from './lib/logger'
import './events'
export default class Server {
  app: express.Application;
  route: express.Router;
  logger: any;
  constructor() {
    this.app = express();
    this.logger = logDebug
  }
  static init() {
    return new this().run();
  }
  registerRoutes() {
    this.app.get("/", (req: express.Request, res: express.Response) => {
      res.status(200).send({ ok: true });
    });
    this.app.use("/", router);
  }
  registerSocket() {}
  async connectDatabase() {
    if (!process.env.MONGODB_URL) {
      this.logger.warn(
        "The environment variables to start MongoDb, not found!"
      );
      throw new Error("The environment variables to start MongoDb, not found!");
    }
    let options: MongooseOptions = {
      dbName: process.env.MONGODB_DBNAME,
      reconnectTries: Number(
        process.env.MONGODB_RECONNECT_TRIES || Number.MAX_VALUE
      ),
      reconnectInterval: Number(process.env.MONGODB_RECONNECT_INTERVAL || 1000),
      socketTimeoutMS: Number(process.env.MONGODB_TIMEOUT || 0),
      poolSize: Number(process.env.MONGODB_POOL_SIZE || 5),
      keepAlive: true,
      useCreateIndex: true,
      useNewUrlParser: true,
      replicaSet: ""
    };

    if (process.env.MONGODB_REPLICASET) {
      options.replicaSet = process.env.MONGODB_REPLICASET;
    }

    await mongoose.connect(process.env.MONGODB_URL, options);
    this.logger.log("MongoDb connected!");
  }
  listRoutes() {
    this.logger.debug("======== ALL ROUTES ===========\n");
    allRoutes(this.app)
      .filter(route => route.path.indexOf("function") < 0)
      .forEach(route => {
        this.logger.debug("\t-" + route.methods.join(",") + "\t" + route.path);
      });
    this.logger.debug("========+++++++++++ ===========\n");
  }
  async run() {
    try {
      await this.connectDatabase();
      this.app.set("json spaces", 2);
      this.app.disable("x-powered-by");
      this.app.options("*", cors());
      this.app.use(compress());
      this.app.use(responseTime());
      this.app.use(express.static(path.join(__dirname, "../public/")));
      this.app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
      this.app.use(bodyParser.json({ limit: "100mb" }));
      this.app.use(methodOverride());
      this.app.use(
        cors({
          origin: "*",
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
        })
      );
      this.registerRoutes();
      const server = http.createServer(this.app);
      // io(server);

      // this.app.set("socketio", io);
      const port = process.env.PORT || 8000;
      const host = process.env.HOST || "localhost";
      const name = process.env.APP_NAME || "tagpanel";
      await server.listen({ port, host }, () =>
        this.logger.log(`${name} running on port ${port}`)
      );
      server.timeout = 10 * 1000 * 60;
      this.listRoutes();
    } catch (err) {
      this.logger.error(`Failure to run application ${err.message}`);
      this.logger.trace(err);
      throw new Error("Application is crashed");
    }
  }
}
