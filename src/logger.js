// src/logger.js
const pino = require('pino');

// Use pino-pretty only in development
const isDev = process.env.NODE_ENV !== 'production';

const logger = isDev
  ? pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    })
  : pino();

module.exports = logger;
