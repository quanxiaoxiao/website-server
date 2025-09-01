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

const initializeServer = async () => {
  try {
    logger.info('Starting server initialization...');
    await connectMongo();
    dispatch('routeMatchList', generateRouteMatchList(routes));
    logger.info('Route match list generated');
  } catch (error) {
    logger.error(`Server initialization failed: ${error.message}`);
    throw error;
  }
};

const handleConnection = (socket) => {
  return handleSocketRequest({
    socket,
    ...createHttpRequestHandler({
      list: selectRouteMatchList(),
      logger,
    }),
  });
};

const createTLSServer = () => {
  logger.warn('Creating Tls Server');
  const state = getState();
  if (!state.tls?.cert || !state.tls?.key) {
    throw new Error('TLS certificate or key is missing');
  }
  const server = tls.createServer(
    {
      cert: state.tls.cert,
      key: state.tls.key,
      minVersion: 'TLSv1.2',
    },
    handleConnection,
  );
  return server;
};

const createHttpServer = () => {
  logger.warn('Creating Http Server');
  const server = net.createServer(handleConnection);
  return server;
};

const startHttpServer = () => {
  const state = getState();
  const port = getValue('server.port');
  const server = state.tls && state.tls.cert ? createTLSServer() : createHttpServer();
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Server failed to start within timeout on port ${port}`));
    }, 10000);

    server.on('error', (error) => {
      clearTimeout(timeoutId);
      logger.error('Server error:', error);
      reject(error);
    });

    server.listen(port, () => {
      clearTimeout(timeoutId);
      const protocol = state.tls?.cert ? 'HTTPS' : 'HTTP';
      logger.info(`${protocol} Server listening on port ${port}`);
      console.log(`${protocol} server listening on port ${port}`);
      resolve(server);
    });
  });

};

const gracefulShutdown = async (signal = 'SIGINT') => {
  try {
    logger.warn(`Received ${signal}, shutting down gracefully...`);
    console.log('server will stop...');
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
  } finally {
    process.exit(0);
  }
};

const setupProcessHandlers = () => {
  process.on('uncaughtException', (error) => {
    console.error('=== UNCAUGHT EXCEPTION ===');
    logger.error(`Uncaught Exception: ${error.message}`);
    console.error(error);
    console.error('=========================');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('=== UNHANDLED REJECTION ===');
    logger.error(`Unhandled Promise Rejection at: ${reason}`);
    console.error('Unhandled Promise Rejection:', reason);
    console.error('===========================');
    process.exit(1);
  });

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

const main = async () => {
  try {
    setupProcessHandlers();

    await initializeServer();
    await startHttpServer();
    logger.info('Server started successfully');
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

setImmediate(main);
