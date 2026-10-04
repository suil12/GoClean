const fs = require('fs');
const path = require('path');

const localDataDirectory = path.join(__dirname, '..', '..', '.netlify-local-data');
const memoryStore = {};

async function getBlobStore() {
  if (!canUseBlobs()) {
    return null;
  }

  try {
    const module = await import('@netlify/blobs');
    return module.getStore('goclean-lux');
  } catch (error) {
    console.error('Could not initialize Netlify Blobs store:', error);
    return null;
  }
}

function canUseBlobs() {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY_BLOBS_TOKEN);
}

function localPath(key) {
  return path.join(localDataDirectory, `${key}.json`);
}

async function readJson(key, fallback) {
  if (Object.prototype.hasOwnProperty.call(memoryStore, key)) {
    return memoryStore[key];
  }

  const store = await getBlobStore();
  if (store) {
    try {
      const value = await store.get(key, { type: 'json' });
      if (value !== null && value !== undefined) {
        memoryStore[key] = value;
        return value;
      }
      return fallback;
    } catch (error) {
      console.error(`Could not read ${key} from Netlify Blobs:`, error);
    }
  }

  try {
    const filePath = localPath(key);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const value = JSON.parse(fs.readFileSync(filePath, 'utf8') || 'null') || fallback;
    memoryStore[key] = value;
    return value;
  } catch (error) {
    console.error(`Could not read local ${key}:`, error);
    return memoryStore[key] ?? fallback;
  }
}

async function writeJson(key, value) {
  memoryStore[key] = value;

  const store = await getBlobStore();
  if (store) {
    try {
      await store.setJSON(key, value);
      return;
    } catch (error) {
      console.error(`Could not write ${key} to Netlify Blobs:`, error);
      return;
    }
  }

  try {
    fs.mkdirSync(localDataDirectory, { recursive: true });
    fs.writeFileSync(localPath(key), JSON.stringify(value, null, 2), 'utf8');
  } catch (error) {
    if (/EROFS|EACCES|EPERM|read-only/i.test(String(error?.message || error))) {
      console.warn(`Using in-memory fallback for ${key} because the local filesystem is read-only.`);
      return;
    }
    throw error;
  }
}

module.exports = {
  readJson,
  writeJson,
};
