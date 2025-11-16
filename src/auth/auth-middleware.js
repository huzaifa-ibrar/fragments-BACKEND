const passport = require('passport');
const { hash } = require('../hash');
const logger = require('../logger');

/**
 * authorize(strategyName)
 *  - wraps passport.authenticate(strategyName)
 *  - on success, attaches req.user and calculates ownerId (hashed email/username)
 */
module.exports = (strategy) => {
  return (req, res, next) => {
    // For tests / development we may want to bypass and inject a test user
    if (process.env.NODE_ENV === 'test' && req.headers['x-test-user']) {
      const u = { email: req.headers['x-test-user'] };
      req.user = { ...u, ownerId: hash(u.email) };
      return next();
    }

    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) {
        logger.error({ err }, 'Auth error');
        return res.status(500).json({ error: 'Authentication error' });
      }
      if (!user) {
        logger.warn({ info }, 'Authentication failed');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      // Ensure we have an identifier to hash
      const idVal = user.email || user.username || user.sub || user.name || 'unknown';
      req.user = { ...user, ownerId: hash(idVal) };
      next();
    })(req, res, next);
  };
};
