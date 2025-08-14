import net from 'node:net';
import process from 'node:process';
import tls from 'node:tls';

import {
  createHttpRequestHandler,
  generateRouteMatchList,
  handleSocketRequest,
} from '@quanxiaoxiao/httttp';

import logger from '#logger.mjs';
import { selectRouteMatchList } from '#selector.mjs';
import { dispatch, getState, getValue } from '#store.mjs';

import connectMongo from './connectMongo.mjs';
import routes from './routes/index.mjs';

class ServerManager {
  constructor() {
    this.server = null;
  }

  setupRoutes() {
    logger.info('Setting up routes...');
    dispatch('routeMatchList', generateRouteMatchList(routes));
  }

  async initialize() {
    try {
      await this.connectDatabase();
      this.setupRoutes();
      await this.createServer();
    } catch (error) {
      logger.error('Server initialization failed:', error);
      process.exit(1);
    }
  }

  async createServer() {
    const state = getState();
    const handler = this.createRequestHandler();

    if (this.shouldUseTLS(state)) {
      this.server = await this.createTLSServer(state, handler);
    } else {
      this.server = await this.createHTTPServer(state, handler);
    }

    this.setupGracefulShutdown();
  }

  createRequestHandler() {
    return (socket) => handleSocketRequest({
      socket,
      ...createHttpRequestHandler({
        list: selectRouteMatchList(),
        logger,
      }),
    });
  }

  async connectDatabase() {
    logger.info('Connecting to MongoDB...');
    await connectMongo();
    logger.info('MongoDB connected successfully');
  }

  shouldUseTLS(state) {
    return state.tls?.cert && state.tls?.key;
  }

  createTLSServer(state, handler) {
    return new Promise((resolve, reject) => {
      const server = tls.createServer(
        {
          cert: state.tls.cert,
          key: state.tls.key,
          minVersion: 'TLSv1.2',
        },
        handler,
      );

      const port = getValue('server.port');

      server.listen(port, (error) => {
        if (error) {
          logger.error(`Failed to start HTTPS server on port ${port}:`, error);
          reject(error);
        } else {
          logger.info(`HTTPS server listening on port ${port}`);
          resolve(server);
        }
      });

      server.on('error', (error) => {
        logger.error('HTTPS server error:', error);
        reject(error);
      });
    });
  }

  createHTTPServer(state, handler) {
    return new Promise((resolve, reject) => {
      const server = net.createServer(handler);
      const port = getValue('server.port');

      server.listen(port, (error) => {
        if (error) {
          logger.error(`Failed to start HTTP server on port ${port}:`, error);
          reject(error);
        } else {
          logger.info(`HTTP server listening on port ${port}`);
          resolve(server);
        }
      });

      server.on('error', (error) => {
        logger.error('HTTP server error:', error);
        reject(error);
      });
    });
  }

  setupGracefulShutdown() {
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      if (this.server) {
        this.server.close((error) => {
          if (error) {
            logger.error('Error during server shutdown:', error);
            process.exit(1);
          } else {
            logger.info('Server closed successfully');
            process.exit(0);
          }
        });

        setTimeout(() => {
          logger.warn('Forcing exit due to timeout');
          process.exit(1);
        }, 3000);
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at: ', promise, 'reason:', reason);
  process.exit(1);
});

const serverManager = new ServerManager();

process.nextTick(async () => {
  await serverManager.initialize();
});
