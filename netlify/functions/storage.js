const fs = require('fs');
const path = require('path');
const { getStore } = require('@netlify/blobs');

const localDataDirectory = path.join(__dirname, '..', '..', '.netlify-local-data');

function canUseBlobs() {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY_BLOBS_TOKEN);
}

function localPath(key) {
  return path.join(localDataDirectory, `${key}.json`);
}

async function readJson(key, fallback) {
  if (canUseBlobs()) {
    try {
      const store = getStore('goclean-lux');
      const value = await store.get(key, { type: 'json' });
      return value || fallback;
    } catch (error) {
      console.error(`Could not read ${key} from Netlify Blobs:`, error);
    }
  }

  try {
    const filePath = localPath(key);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8') || 'null') || fallback;
  } catch (error) {
    console.error(`Could not read local ${key}:`, error);
    return fallback;
  }
}

async function writeJson(key, value) {
  if (canUseBlobs()) {
    try {
      const store = getStore('goclean-lux');
      await store.setJSON(key, value);
      return;
    } catch (error) {
      console.error(`Could not write ${key} to Netlify Blobs:`, error);
      throw error;
    }
  }

  fs.mkdirSync(localDataDirectory, { recursive: true });
  fs.writeFileSync(localPath(key), JSON.stringify(value, null, 2), 'utf8');
}

module.exports = {
  readJson,
  writeJson,
};
