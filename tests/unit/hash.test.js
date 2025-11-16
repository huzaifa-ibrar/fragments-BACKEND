const { hash } = require('../../src/hash');

describe('hash()', () => {
  const email = 'user1@example.com';
  const anotherEmail = 'user2@example.com';

  test('hash returns deterministic SHA-256 hex string', () => {
    const hashedEmail = hash(email);
    expect(hashedEmail).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hex is 64 chars
    expect(hashedEmail).toBe(hash(email)); // same input → same output
  });

  test('different inputs produce different hashes', () => {
    const hash1 = hash(email);
    const hash2 = hash(anotherEmail);
    expect(hash1).not.toBe(hash2);
  });

  test('empty string can be hashed', () => {
    const emptyHash = hash('');
    expect(emptyHash).toMatch(/^[0-9a-f]{64}$/);
  });

  test('hash is reproducible for multiple calls', () => {
    const input = 'repeat-me';
    const first = hash(input);
    const second = hash(input);
    expect(first).toBe(second);
  });
});
