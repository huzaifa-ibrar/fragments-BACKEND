const logger = require('../logger');

module.exports = (err, req, res, next) => {
  logger.error({ err }, 'Unhandled Error');

  if (res.headersSent) {
    return next(err);
  }

  if (typeof res.status !== 'function') {
    console.error('⚠️ res is not a valid Express response object');
    return;
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
};
