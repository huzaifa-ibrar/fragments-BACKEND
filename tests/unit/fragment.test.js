const Fragment = require('../../src/model/fragment');

// Helper to wait for timestamp differences
const wait = async (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

const validTypes = [
  'text/plain',
  // Additional types can be added in future, but only text/plain is supported now
];

describe('Fragment class', () => {
  test('common formats are supported', () => {
    validTypes.forEach((format) => expect(Fragment.isSupportedType(format)).toBe(true));
  });

  describe('Fragment constructor', () => {
    test('ownerId and type are required', () => {
      expect(() => new Fragment({})).toThrow();
    });

    test('ownerId is required', () => {
      expect(() => new Fragment({ type: 'text/plain', size: 1 })).toThrow();
    });

    test('type is required', () => {
      expect(() => new Fragment({ ownerId: '1234', size: 1 })).toThrow();
    });

    test('type can include charset', () => {
      const frag = new Fragment({ ownerId: '1234', type: 'text/plain; charset=utf-8', size: 0 });
      expect(frag.type).toBe('text/plain; charset=utf-8');
    });

    test('size defaults to 0 if missing', () => {
      const frag = new Fragment({ ownerId: '1234', type: 'text/plain' });
      expect(frag.size).toBe(0);
    });

    test('size must be number >= 0', () => {
      expect(() => new Fragment({ ownerId: '1234', type: 'text/plain', size: -1 })).toThrow();
      expect(() => new Fragment({ ownerId: '1234', type: 'text/plain', size: '1' })).toThrow();
      expect(() => new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 })).not.toThrow();
    });

    test('fragments have id and timestamps', () => {
      const frag = new Fragment({ ownerId: '1234', type: 'text/plain', size: 1 });
      expect(frag.id).toMatch(
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
      );
      expect(Date.parse(frag.created)).not.toBeNaN();
      expect(Date.parse(frag.updated)).not.toBeNaN();
    });
  });

  describe('isSupportedType()', () => {
    test('supports text/plain with and without charset', () => {
      expect(Fragment.isSupportedType('text/plain')).toBe(true);
      expect(Fragment.isSupportedType('text/plain; charset=utf-8')).toBe(true);
    });

    test('rejects unsupported types', () => {
      expect(Fragment.isSupportedType('application/msword')).toBe(false);
      expect(Fragment.isSupportedType('audio/webm')).toBe(false);
    });
  });

  describe('mimeType and isText', () => {
    test('mimeType returns type without charset', () => {
      const frag = new Fragment({ ownerId: '1234', type: 'text/plain; charset=utf-8', size: 0 });
      expect(frag.mimeType).toBe('text/plain');
    });

    test('isText returns true for text/plain', () => {
      const frag = new Fragment({ ownerId: '1234', type: 'text/plain; charset=utf-8', size: 0 });
      expect(frag.isText).toBe(true);
    });
  });

  describe('formats', () => {
    test('formats returns correct array', () => {
      const frag = new Fragment({ ownerId: '1234', type: 'text/plain; charset=utf-8', size: 0 });
      expect(frag.formats).toEqual(['text/plain']);
    });
  });

  describe('Fragment persistence methods', () => {
    test('byUser() returns empty array if none', async () => {
      expect(await Fragment.byUser('no-user')).toEqual([]);
    });

    test('save() stores a fragment and setData() works', async () => {
      const owner = 'user1';
      const frag = new Fragment({ ownerId: owner, type: 'text/plain', size: 0 });
      await frag.save();

      const data = Buffer.from('Hello World');
      await frag.setData(data);

      const frag2 = await Fragment.byId(owner, frag.id);
      expect(await frag2.getData()).toEqual(data);
      expect(frag2.id).toBe(frag.id);
    });

    test('save() updates updated timestamp', async () => {
      const owner = 'user2';
      const frag = new Fragment({ ownerId: owner, type: 'text/plain', size: 0 });
      await frag.save();
      const prevUpdated = frag.updated;
      await wait();
      await frag.save();
      const frag2 = await Fragment.byId(owner, frag.id);
      expect(Date.parse(frag2.updated)).toBeGreaterThan(Date.parse(prevUpdated));
    });

    test('setData() updates size and updated timestamp', async () => {
      const owner = 'user3';
      const frag = new Fragment({ ownerId: owner, type: 'text/plain', size: 0 });
      await frag.save();
      await frag.setData(Buffer.from('a'));
      expect(frag.size).toBe(1);

      const frag2 = await Fragment.byId(owner, frag.id);
      expect(frag2.size).toBe(1);
    });

    test('setData() throws if not a Buffer', async () => {
      const frag = new Fragment({ ownerId: 'user4', type: 'text/plain', size: 0 });
      await frag.save();
      await expect(frag.setData('string')).rejects.toThrow();
    });

    test('fragments can be deleted', async () => {
      const owner = 'user5';
      const frag = new Fragment({ ownerId: owner, type: 'text/plain', size: 0 });
      await frag.save();
      await frag.setData(Buffer.from('delete me'));
      await Fragment.delete(owner, frag.id);
      await expect(Fragment.byId(owner, frag.id)).rejects.toThrow();
    });

    test('byUser(full=true) returns full fragment objects', async () => {
      const owner = 'user6';
      const frag = new Fragment({ ownerId: owner, type: 'text/plain', size: 0 });
      await frag.save();
      await frag.setData(Buffer.from('full test'));
      const allFrags = await Fragment.byUser(owner, true);
      expect(allFrags[0].id).toBe(frag.id);
      expect(await allFrags[0].getData()).toEqual(Buffer.from('full test'));
    });
  });

  describe('create() + read()', () => {
    test('create + read fragment (text/plain)', async () => {
      const owner = 'owner-frag';
      const buffer = Buffer.from('Hello Fragments');
      const frag = await Fragment.create(owner, 'text/plain', buffer);
      expect(frag).toHaveProperty('id');
      expect(frag.type).toBe('text/plain');

      const meta = await Fragment.read(owner, frag.id);
      expect(meta.id).toBe(frag.id);

      const data = await Fragment.readData(owner, frag.id);
      expect(data.toString()).toBe('Hello Fragments');
    });

    test('create unsupported type throws 415', async () => {
      await expect(Fragment.create('owner', 'image/png', Buffer.alloc(0))).rejects.toHaveProperty(
        'status',
        415
      );
    });
  });
});
