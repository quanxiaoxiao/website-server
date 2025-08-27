import { select } from '@quanxiaoxiao/datav';
import * as dotenv from 'dotenv';

dotenv.config({
  debug: false,
  quiet: true,
});

export default {
  dateTimeCreate: Date.now(),
  server: {
    port: select({ type: 'integer' })(process.env.SERVER_PORT),
  },
  routeMatchList: [],
  mongo: {
    connect: false,
    dateTimeConnect: null,
    hostname: process.env.MONGO_HOSTNAME || '127.0.0.1',
    port: select({ type: 'integer' })(process.env.MONGO_PORT),
    database: process.env.MONGO_DATABASE,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
  },
};
