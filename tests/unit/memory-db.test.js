const db = require('../../src/model/data/memory/memory-db');

describe('Memory DB', () => {
  const owner = 'owner1';
  const owner2 = 'owner2';

  beforeEach(async () => {
    // reset in-memory DB if needed
    if (db.clear) db.clear();
  });

  test('write/read fragment metadata', async () => {
    const meta = { id: 'id1', ownerId: owner, type: 'text/plain' };
    await db.writeFragment(owner, meta);

    const gotMeta = await db.readFragment(owner, 'id1');
    expect(gotMeta).toEqual(meta);
  });

  test('write/read fragment data', async () => {
    const meta = { id: 'id2', ownerId: owner, type: 'text/plain' };
    await db.writeFragment(owner, meta);

    const data = Buffer.from('hello world');
    await db.writeFragmentData(owner, 'id2', data);

    const readData = await db.readFragmentData(owner, 'id2');
    expect(Buffer.isBuffer(readData)).toBe(true);
    expect(readData.toString()).toBe('hello world');
  });

  test('listFragments returns all fragment IDs for a user', async () => {
    const metaA = { id: 'a1', ownerId: owner, type: 'text/plain' };
    const metaB = { id: 'b1', ownerId: owner, type: 'text/plain' };
    const metaC = { id: 'c1', ownerId: owner2, type: 'text/plain' };

    await db.writeFragment(owner, metaA);
    await db.writeFragment(owner, metaB);
    await db.writeFragment(owner2, metaC);

    const listOwner1 = await db.listFragments(owner);
    expect(listOwner1).toEqual(expect.arrayContaining(['a1', 'b1']));

    const listOwner2 = await db.listFragments(owner2);
    expect(listOwner2).toEqual(['c1']);
  });

  test('deleteFragment removes fragment metadata and data', async () => {
    const meta = { id: 'del1', ownerId: owner, type: 'text/plain' };
    const data = Buffer.from('delete me');

    await db.writeFragment(owner, meta);
    await db.writeFragmentData(owner, 'del1', data);

    await db.deleteFragment(owner, 'del1');

    await expect(db.readFragment(owner, 'del1')).rejects.toThrow();
    await expect(db.readFragmentData(owner, 'del1')).rejects.toThrow();
  });

  test('readFragment throws if fragment does not exist', async () => {
    await expect(db.readFragment(owner, 'missing')).rejects.toThrow();
  });

  test('readFragmentData throws if fragment data does not exist', async () => {
    const meta = { id: 'data1', ownerId: owner, type: 'text/plain' };
    await db.writeFragment(owner, meta);

    await expect(db.readFragmentData(owner, 'missing')).rejects.toThrow();
  });

  test('writeFragment expects metadata with id and ownerId', async () => {
    await expect(db.writeFragment(owner, {})).rejects.toThrow();
  });

  test('writeFragmentData expects Buffer', async () => {
    const meta = { id: 'buf1', ownerId: owner, type: 'text/plain' };
    await db.writeFragment(owner, meta);

    await expect(db.writeFragmentData(owner, 'buf1', 'not buffer')).rejects.toThrow();
  });
});
