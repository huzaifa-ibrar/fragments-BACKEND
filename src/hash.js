// const crypto = require('crypto');

// /**
//  * @param {string} email user's email address
//  * @returns string Hashed email address
//  */
// module.exports = (email) => crypto.createHash('sha256').update(email).digest('hex');

const crypto = require('crypto');
const secret = process.env.HASH_SECRET || 'secret';

function hash(value) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

module.exports = { hash };
