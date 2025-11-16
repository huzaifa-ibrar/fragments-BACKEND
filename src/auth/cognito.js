const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const jwksRsa = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const jwksUri = process.env.COGNITO_JWKS_URI || process.env.COGNITO_JWKS_URI;
let client;

if (jwksUri) {
  client = jwksRsa({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    jwksUri,
  });

  passport.use(
    'bearer',
    new BearerStrategy(async (token, done) => {
      try {
        const decodedHeader = jwt.decode(token, { complete: true });
        const kid = decodedHeader?.header?.kid;
        if (!kid) return done(null, false);

        const key = await client.getSigningKey(kid);
        const pubKey = key.getPublicKey();

        const payload = jwt.verify(token, pubKey, {
          // audience & issuer checks can be added here using env vars
        });

        // payload contains claims like email, sub, etc.
        return done(null, payload);
      } catch (err) {
        logger.warn({ err }, 'Bearer token verification failed');
        return done(null, false);
      }
    })
  );
} else {
  logger.info(
    { jwksUri },
    'COGNITO_JWKS_URI not configured — bearer strategy will not validate tokens'
  );
  // register a fallback bearer strategy that always rejects (so code doesn't crash)
  passport.use(
    'bearer',
    new BearerStrategy((token, done) => {
      return done(null, false);
    })
  );
}

module.exports.authenticate = () => require('./auth-middleware')('bearer');
