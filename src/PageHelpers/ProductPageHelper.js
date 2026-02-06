/**
 * Product Page Helper
 * 
 * Purpose: Semantic wrapper methods for product-related actions
 * Pattern: Hybrid approach - JSON locators + OOP semantic methods
 * Benefits:
 *  - Readable test code (productHelper.addFirstProductToCart())
 *  - Maintainable locators (JSON-based)
 *  - Encapsulated business logic
 *  - Reusable across multiple tests
 * 
 * @author Automation Team
 * @version 1.0
 * @created December 4, 2025
 */

class ProductPageHelper {
  /**
   * Constructor
   * @param {Object} core - CoreKeywords instance with 100+ automation methods
   * @param {Object} sitemaps - Sitemap constants for JSON file names
   * @param {Object} page - Playwright page object
   * @param {Object} loc - Localization parser instance
   */
  constructor(core, sitemaps, page, loc) {
    this.core = core;
    this.sitemaps = sitemaps;
    this.page = page;
    this.loc = loc;
  }

  // ==================== Navigation Methods ====================

  /**
   * Navigate to Products page from anywhere
   */
  async navigateToProducts() {
    await this.core.clickElement(this.sitemaps.home, 'HomeScreen', 'ProductsLinkOption');
    await this.page.waitForURL('**/products');
  }

  /**
   * View first product details
   */
  async viewFirstProduct() {
    await this.core.clickElement(this.sitemaps.products, 'Products', 'FirstViewProductButton');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * View specific product by index (0-based)
   * @param {number} index - Product index
   */
  async viewProductByIndex(index) {
    const viewButtons = await this.core.getElement(this.sitemaps.products, 'Products', 'ViewProductButtons');
    await viewButtons.nth(index).click();
    await this.page.waitForURL('**/product_details/**', { timeout: 10000 });
  }

  // ==================== Cart Operations ====================

  /**
   * Add first product to cart with hover
   */
  async addFirstProductToCart() {
    const firstProduct = await this.core.getFirstElement(this.sitemaps.products, 'Products', 'ProductImageWrapper');
    await firstProduct.hover();
    await this.page.waitForTimeout(500); // Hover effect delay
    await this.core.clickElement(this.sitemaps.products, 'Products', 'FirstProductAddToCartButton');
    await this.core.waitForVisible(this.sitemaps.products, 'Products', 'ModalDialog');
  }

  /**
   * Add second product to cart with hover
   */
  async addSecondProductToCart() {
    const secondProduct = await this.page.locator('.product-image-wrapper').nth(1);
    await secondProduct.hover();
    await this.page.waitForTimeout(500); // Hover effect delay
    await this.core.clickElement(this.sitemaps.products, 'Products', 'SecondProductAddToCartButton');
    await this.core.waitForVisible(this.sitemaps.products, 'Products', 'ModalDialog');
  }

  /**
   * Add product to cart from detail page with custom quantity
   * @param {string} quantity - Product quantity (default: '1')
   */
  async addToCartFromDetailPage(quantity = '1') {
    if (quantity !== '1') {
      await this.core.fillText(this.sitemaps.products, 'ProductDetail', 'ProductQuantityInput', quantity);
    }
    await this.core.clickElement(this.sitemaps.products, 'ProductDetail', 'AddToCartButton');
    await this.core.waitForVisible(this.sitemaps.products, 'Products', 'ModalDialog');
  }

  /**
   * Click "Continue Shopping" button in modal
   */
  async continueShopping() {
    await this.core.clickElement(this.sitemaps.products, 'Products', 'ContinueShoppingButton');
    await this.core.waitForHidden(this.sitemaps.products, 'Products', 'ModalDialog');
  }

  /**
   * Click "View Cart" button in modal
   */
  async viewCartFromModal() {
    await this.core.clickElement(this.sitemaps.products, 'Products', 'ViewCartButtonInModal');
    await this.page.waitForURL('**/view_cart');
    await this.page.waitForLoadState('networkidle');
  }

  // ==================== Search Operations ====================

  /**
   * Search for products by keyword
   * @param {string} keyword - Search keyword
   */
  async searchProduct(keyword) {
    await this.core.fillText(this.sitemaps.products, 'Products', 'SearchProductInput', keyword);
    await this.core.clickElement(this.sitemaps.products, 'Products', 'SearchButton');
    await this.page.waitForURL('**/products?search=**');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ==================== Verification Methods ====================

  /**
   * Verify products page is displayed
   * @returns {boolean} True if products page is visible
   */
  async isProductsPageVisible() {
    const allProductsHeading = await this.core.getElement(this.sitemaps.products, 'Products', 'AllProductsHeading');
    const headingText = await this.core.getText(this.sitemaps.products, 'Products', 'AllProductsHeading');
    const expectedHeading = this.loc.getValue('ResourcesStrings', 'Products.AllProductsHeading');
    return headingText.trim() === expectedHeading;
  }

  /**
   * Verify search results page is displayed
   * @returns {boolean} True if search results visible
   */
  async isSearchResultsVisible() {
    const searchedHeading = await this.core.getElement(this.sitemaps.products, 'Products', 'SearchedProductsHeading');
    const headingText = await this.core.getText(this.sitemaps.products, 'Products', 'SearchedProductsHeading');
    const expectedHeading = this.loc.getValue('ResourcesStrings', 'Products.SearchedProductsHeading');
    return headingText.trim() === expectedHeading;
  }

  /**
   * Verify product detail page is loaded
   * @returns {Object} Product details object
   */
  async getProductDetails() {
    const details = {
      name: await this.core.getText(this.sitemaps.products, 'ProductDetail', 'ProductName'),
      category: await this.core.getText(this.sitemaps.products, 'ProductDetail', 'ProductCategory'),
      price: await this.core.getText(this.sitemaps.products, 'ProductDetail', 'ProductPrice'),
      availability: await this.core.getText(this.sitemaps.products, 'ProductDetail', 'ProductAvailability'),
      condition: await this.core.getText(this.sitemaps.products, 'ProductDetail', 'ProductCondition'),
      brand: await this.core.getText(this.sitemaps.products, 'ProductDetail', 'ProductBrand')
    };
    return details;
  }

  /**
   * Get count of products in listing
   * @returns {number} Product count
   */
  async getProductCount() {
    return await this.core.getElementCount(this.sitemaps.products, 'Products', 'ProductImageWrapper');
  }

  /**
   * Get all product names from listing
   * @returns {Array<string>} Array of product names
   */
  async getAllProductNames() {
    const names = await this.core.getAllTextContents(this.sitemaps.products, 'Products', 'ProductInfoParagraphs');
    return names.map(name => name.trim());
  }

  /**
   * Verify search results contain keyword
   * @param {string} keyword - Expected keyword
   * @returns {boolean} True if at least one product matches
   */
  async searchResultsContainKeyword(keyword) {
    const productNames = await this.getAllProductNames();
    return productNames.some(name => name.toLowerCase().includes(keyword.toLowerCase()));
  }

  // ==================== Workflow Methods ====================

  /**
   * Complete workflow: Navigate to products and search
   * @param {string} keyword - Search keyword
   */
  async navigateAndSearch(keyword) {
    await this.navigateToProducts();
    await this.searchProduct(keyword);
  }

  /**
   * Complete workflow: Add product to cart and continue shopping
   */
  async addFirstProductAndContinue() {
    await this.addFirstProductToCart();
    await this.continueShopping();
  }

  /**
   * Complete workflow: Add product to cart and view cart
   */
  async addFirstProductAndViewCart() {
    await this.addFirstProductToCart();
    await this.viewCartFromModal();
  }

  /**
   * Complete workflow: Add multiple products to cart
   * @param {number} count - Number of products to add (default: 2)
   */
  async addMultipleProductsToCart(count = 2) {
    if (count >= 1) {
      await this.addFirstProductToCart();
      await this.continueShopping();
    }
    if (count >= 2) {
      await this.addSecondProductToCart();
      await this.continueShopping();
    }
    // Can extend for more products if needed
  }
}

module.exports = ProductPageHelper;
