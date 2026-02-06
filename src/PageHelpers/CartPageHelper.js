/**
 * Cart Page Helper
 * 
 * Purpose: Semantic wrapper methods for cart-related operations
 * Pattern: Hybrid approach - JSON locators + OOP semantic methods
 * Benefits:
 *  - Readable test code (cartHelper.verifyProductInCart())
 *  - Maintainable locators (JSON-based)
 *  - Cart verification logic encapsulated
 * 
 * @author Automation Team
 * @version 1.0
 * @created December 4, 2025
 */

class CartPageHelper {
  /**
   * Constructor
   * @param {Object} core - CoreKeywords instance
   * @param {Object} sitemaps - Sitemap constants
   * @param {Object} page - Playwright page object
   */
  constructor(core, sitemaps, page) {
    this.core = core;
    this.sitemaps = sitemaps;
    this.page = page;
  }

  // ==================== Cart Information Methods ====================

  /**
   * Get total number of products in cart
   * @returns {number} Count of cart items
   */
  async getCartItemCount() {
    return await this.core.getElementCount(this.sitemaps.cart, 'Cart', 'CartTableRows');
  }

  /**
   * Get product details from cart by index (1-based)
   * @param {number} index - Product index (1 = first product, 2 = second product)
   * @returns {Object} Product details object
   */
  async getProductDetails(index) {
    const indexMap = {
      1: 'First',
      2: 'Second',
      3: 'Third',
      4: 'Fourth'
    };
    
    const prefix = indexMap[index] || 'First';
    
    const details = {
      name: await this.core.getText(this.sitemaps.cart, 'Cart', `${prefix}ProductName`),
      price: await this.core.getText(this.sitemaps.cart, 'Cart', `${prefix}ProductPrice`),
      quantity: await this.core.getText(this.sitemaps.cart, 'Cart', `${prefix}ProductQuantity`),
      total: await this.core.getText(this.sitemaps.cart, 'Cart', `${prefix}ProductTotal`)
    };
    
    return details;
  }

  /**
   * Get all cart product details
   * @returns {Array<Object>} Array of product details
   */
  async getAllProductDetails() {
    const count = await this.getCartItemCount();
    const products = [];
    
    for (let i = 1; i <= Math.min(count, 4); i++) {
      const product = await this.getProductDetails(i);
      products.push(product);
    }
    
    return products;
  }

  // ==================== Verification Methods ====================

  /**
   * Verify cart has expected number of products
   * @param {number} expectedCount - Expected product count
   * @returns {boolean} True if count matches
   */
  async verifyCartItemCount(expectedCount) {
    const actualCount = await this.getCartItemCount();
    return actualCount === expectedCount;
  }

  /**
   * Verify product price equals total (for quantity 1)
   * @param {number} index - Product index (1-based)
   * @returns {boolean} True if price equals total
   */
  async verifyPriceEqualsTotal(index) {
    const product = await this.getProductDetails(index);
    return product.price.trim() === product.total.trim();
  }

  /**
   * Verify product quantity
   * @param {number} index - Product index (1-based)
   * @param {string} expectedQuantity - Expected quantity
   * @returns {boolean} True if quantity matches
   */
  async verifyProductQuantity(index, expectedQuantity) {
    const product = await this.getProductDetails(index);
    return product.quantity.trim() === expectedQuantity.toString();
  }

  /**
   * Verify product name is not empty
   * @param {number} index - Product index (1-based)
   * @returns {boolean} True if name has content
   */
  async verifyProductNameExists(index) {
    const product = await this.getProductDetails(index);
    return product.name.trim().length > 0;
  }

  /**
   * Verify product price contains currency symbol
   * @param {number} index - Product index (1-based)
   * @param {string} currency - Currency symbol (e.g., 'Rs.')
   * @returns {boolean} True if price contains currency
   */
  async verifyProductPriceCurrency(index, currency) {
    const product = await this.getProductDetails(index);
    return product.price.trim().includes(currency);
  }

  // ==================== Cart Actions ====================

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.core.clickElement(this.sitemaps.cart, 'Cart', 'ProceedToCheckoutButton');
  }

  /**
   * Remove product from cart by index
   * @param {number} index - Product index (1-based)
   */
  async removeProductFromCart(index) {
    const indexMap = {
      1: 'First',
      2: 'Second',
      3: 'Third',
      4: 'Fourth'
    };
    
    const prefix = indexMap[index] || 'First';
    await this.core.clickElement(this.sitemaps.cart, 'Cart', `${prefix}ProductDeleteButton`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear entire cart (remove all products)
   */
  async clearCart() {
    const count = await this.getCartItemCount();
    for (let i = 1; i <= count; i++) {
      await this.removeProductFromCart(1); // Always remove first item
      await this.page.waitForTimeout(500); // Wait for cart to update
    }
  }

  // ==================== Subscription Methods ====================

  /**
   * Subscribe to newsletter from cart page footer
   * @param {string} email - Email address to subscribe
   */
  async subscribeToNewsletter(email) {
    await this.core.fillText(this.sitemaps.cart, 'Cart', 'SubscriptionEmailInput', email);
    await this.core.clickElement(this.sitemaps.cart, 'Cart', 'SubscriptionButton');
  }

  /**
   * Verify subscription success message in cart page
   * @returns {boolean} True if success message visible
   */
  async isSubscriptionSuccessVisible() {
    try {
      const successMessage = await this.core.getElement(this.sitemaps.cart, 'Cart', 'SubscriptionSuccessMessage');
      return await successMessage.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  // ==================== Workflow Methods ====================

  /**
   * Verify multiple products in cart with full details
   * @param {number} productCount - Expected number of products
   * @param {string} currency - Currency symbol
   * @returns {Object} Verification results
   */
  async verifyMultipleProducts(productCount, currency = 'Rs.') {
    const results = {
      countMatch: await this.verifyCartItemCount(productCount),
      products: []
    };
    
    for (let i = 1; i <= productCount; i++) {
      const product = await this.getProductDetails(i);
      const verification = {
        index: i,
        details: product,
        nameExists: product.name.trim().length > 0,
        hasCurrency: product.price.trim().includes(currency),
        quantityIsOne: product.quantity.trim() === '1',
        priceEqualsTotal: product.price.trim() === product.total.trim()
      };
      results.products.push(verification);
    }
    
    return results;
  }

  /**
   * Subscribe and verify in cart page
   * @param {string} email - Email address
   * @returns {boolean} True if subscription successful
   */
  async subscribeAndVerify(email) {
    await this.subscribeToNewsletter(email);
    return await this.isSubscriptionSuccessVisible();
  }

  /**
   * Log cart summary to console
   */
  async logCartSummary() {
    const products = await this.getAllProductDetails();
    console.log(`\n📦 Cart Summary:`);
    console.log(`   Total Items: ${products.length}`);
    
    products.forEach((product, index) => {
      console.log(`\n   Product ${index + 1}:`);
      console.log(`      Name: ${product.name.trim()}`);
      console.log(`      Price: ${product.price.trim()}`);
      console.log(`      Quantity: ${product.quantity.trim()}`);
      console.log(`      Total: ${product.total.trim()}`);
    });
  }
}

module.exports = CartPageHelper;
