/**
 * Simple memory DB for fragments
 * Structure:
 *   Map ownerId -> Map fragmentId -> { meta: {...}, data: Buffer }
 */

const fragments = new Map();

// --- Helper to validate keys ---
function validateKey(key, name = 'key') {
  if (typeof key !== 'string') throw new Error(`${name} must be a string`);
}

// --- Write fragment metadata ---
async function writeFragment(ownerId, fragmentMeta) {
  validateKey(ownerId, 'ownerId');

  if (!fragmentMeta?.id || !fragmentMeta?.ownerId) {
    throw new Error('Fragment meta must have id and ownerId');
  }

  if (!fragments.has(ownerId)) fragments.set(ownerId, new Map());
  fragments.get(ownerId).set(fragmentMeta.id, { meta: fragmentMeta, data: null });
  return fragmentMeta.id;
}

// --- Read fragment metadata ---
async function readFragment(ownerId, id) {
  validateKey(ownerId, 'ownerId');
  validateKey(id, 'id');

  const ownerMap = fragments.get(ownerId);
  if (!ownerMap || !ownerMap.has(id)) throw new Error('Fragment not found');
  return ownerMap.get(id).meta;
}

// --- Write fragment data ---
async function writeFragmentData(ownerId, id, data) {
  validateKey(ownerId, 'ownerId');
  validateKey(id, 'id');

  if (!Buffer.isBuffer(data)) throw new Error('Data must be a Buffer');

  const ownerMap = fragments.get(ownerId);
  if (!ownerMap || !ownerMap.has(id)) throw new Error('Fragment not found');

  ownerMap.get(id).data = data;
  return true;
}

// --- Read fragment data ---
async function readFragmentData(ownerId, id) {
  validateKey(ownerId, 'ownerId');
  validateKey(id, 'id');

  const ownerMap = fragments.get(ownerId);
  if (!ownerMap || !ownerMap.has(id)) throw new Error('Fragment not found');

  const data = ownerMap.get(id).data;
  if (!data) throw new Error('Fragment data not found');
  return data;
}

// --- List all fragment IDs for an owner ---
async function listFragments(ownerId) {
  validateKey(ownerId, 'ownerId');

  const ownerMap = fragments.get(ownerId);
  if (!ownerMap) return [];
  return Array.from(ownerMap.keys());
}

// --- Delete a fragment ---
async function deleteFragment(ownerId, id) {
  validateKey(ownerId, 'ownerId');
  validateKey(id, 'id');

  const ownerMap = fragments.get(ownerId);
  if (!ownerMap || !ownerMap.has(id)) throw new Error('Fragment not found');
  ownerMap.delete(id);
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};
