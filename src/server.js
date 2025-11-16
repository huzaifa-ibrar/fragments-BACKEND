const app = require('./app');
const logger = require('./logger');

const port = process.env.PORT || 8080;
const server = app.listen(port, () => logger.info(`Server listening on ${port}`));

module.exports = { app, server };
