const passport = require('passport');
const { BasicStrategy } = require('passport-http');

passport.use(
  'basic',
  new BasicStrategy((username, password, done) => {
    // Accept credentials from environment variables
    if (username === process.env.BASIC_AUTH_USER && password === process.env.BASIC_AUTH_PASSWORD) {
      // Return user object with ownerId (used in Fragment)
      return done(null, { email: username, ownerId: username });
    }

    // fallback default dev user (optional)
    if (username === 'admin' && password === 'password') {
      return done(null, { email: username, ownerId: username });
    }

    // fail authentication
    return done(null, false);
  })
);

module.exports.authenticate = () => require('./auth-middleware')('basic');
