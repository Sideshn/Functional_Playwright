// JSON Localization Parser - replaces LocalizationParser
const fs = require('fs');
const path = require('path');

class JsonLocalizationParser {
  constructor() {
    this._cache = {};
  }

  getValue(resourceFileName, key) {
    // Load resource file if not cached
    if (!this._cache[resourceFileName]) {
      this.load(resourceFileName);
    }
    
    // Support nested keys with dot notation (e.g., 'AccountCreation.SuccessTitle')
    const keys = key.split('.');
    let value = this._cache[resourceFileName];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        throw new Error(`Key '${key}' not found in resource '${resourceFileName}'.`);
      }
    }
    
    return value;
  }

  load(resourceFileName) {
    const file = path.join(process.cwd(), 'Resources', 'Localization', `${resourceFileName}.json`);
    
    if (!fs.existsSync(file)) {
      throw new Error(`Localization file not found: ${file}`);
    }

    const jsonContent = fs.readFileSync(file, 'utf-8');
    this._cache[resourceFileName] = JSON.parse(jsonContent);
  }

  // Helper method to get all keys
  getAllKeys(resourceFileName) {
    if (!this._cache[resourceFileName]) {
      this.load(resourceFileName);
    }

    return Object.keys(this._cache[resourceFileName]);
  }

  // Helper method to get all values
  getAllValues(resourceFileName) {
    if (!this._cache[resourceFileName]) {
      this.load(resourceFileName);
    }

    return this._cache[resourceFileName];
  }

  // Helper method to check if key exists
  hasKey(resourceFileName, key) {
    if (!this._cache[resourceFileName]) {
      this.load(resourceFileName);
    }

    // Support nested keys with dot notation
    const keys = key.split('.');
    let value = this._cache[resourceFileName];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }
    
    return value !== undefined;
  }
}

module.exports = JsonLocalizationParser;
