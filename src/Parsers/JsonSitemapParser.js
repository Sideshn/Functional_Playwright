// JSON Sitemap Parser - replaces XmlSitemapParser
const fs = require('fs');
const path = require('path');

class JsonSitemapParser {
  constructor() {
    this._cache = {};
  }

  getLocator(sitemapName, pageKey, elementKey) {
    // Load sitemap if not cached
    if (!this._cache[sitemapName]) {
      this.load(sitemapName);
    }

    const sitemap = this._cache[sitemapName];
    
    // Check if page exists
    if (!sitemap.pages[pageKey]) {
      throw new Error(`Page '${pageKey}' not found in sitemap '${sitemapName}'`);
    }

    const page = sitemap.pages[pageKey];
    
    // Check if element exists
    if (!page.elements[elementKey]) {
      throw new Error(`Element '${elementKey}' not found in page '${pageKey}' of sitemap '${sitemapName}'`);
    }

    const element = page.elements[elementKey];
    
    // Handle different locator types
    // Priority: type-specific > id > xpath > name > class
    
    // Handle role-based locators (getByRole)
    if (element.type === 'role' && element.role) {
      return { 
        type: 'role', 
        value: element.role,
        options: element.roleOptions || {}
      };
    }
    
    // Handle data-qa locators
    if (element.type === 'data-qa' && element.dataQa) {
      return { 
        type: 'css', 
        value: `[data-qa="${element.dataQa}"]` 
      };
    }
    
    // Handle standard locators
    if (element.id) {
      return { type: 'css', value: element.id };
    }
    if (element.xpath) {
      return { type: 'xpath', value: element.xpath };
    }
    if (element.name) {
      return { type: 'name', value: element.name };
    }
    if (element.class) {
      return { type: 'css', value: element.class };
    }

    throw new Error(`No valid locator found for ${sitemapName}:${pageKey}:${elementKey}`);
  }

  load(sitemapName) {
    const file = path.join(process.cwd(), 'Resources', 'Sitemaps', `${sitemapName}.json`);
    
    if (!fs.existsSync(file)) {
      throw new Error(`Sitemap file not found: ${file}`);
    }

    const jsonContent = fs.readFileSync(file, 'utf-8');
    this._cache[sitemapName] = JSON.parse(jsonContent);
  }

  // Helper method to get all elements for a page
  getPageElements(sitemapName, pageKey) {
    if (!this._cache[sitemapName]) {
      this.load(sitemapName);
    }

    const sitemap = this._cache[sitemapName];
    
    if (!sitemap.pages[pageKey]) {
      throw new Error(`Page '${pageKey}' not found in sitemap '${sitemapName}'`);
    }

    return sitemap.pages[pageKey].elements;
  }

  // Helper method to get all pages in a sitemap
  getAllPages(sitemapName) {
    if (!this._cache[sitemapName]) {
      this.load(sitemapName);
    }

    return Object.keys(this._cache[sitemapName].pages);
  }
}

module.exports = JsonSitemapParser;
