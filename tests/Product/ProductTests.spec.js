/**
 * Test Suite: Product Tests - Consolidated
 * 
 * Purpose: Comprehensive product testing including navigation, search, and cart functionality
 * Framework: Playwright with JavaScript - Using Existing Framework
 * Pattern: Page Object Model with JSON Parsers
 * 
 * Test Coverage:
 * - TC008: Verify All Products and product detail page
 * - TC009: Search Product
 * - TC012: Add Products in Cart
 * 
 * @author Automation Team
 * @version 1.0
 * @updated November 13, 2025
 */

const { test: pageTest } = require('../../src/fixtures/pageFixtures');
const { expect } = require('@playwright/test');

pageTest.describe('Product Tests', () => {
  
  // Use beforeEach for cookie clearing (test-specific setup)
  pageTest.beforeEach(async ({ page , sitemaps}) => {
    // Clear cart cookies to ensure test isolation
    await page.context().clearCookies();
  });

  /**
   * TC008: Verify All Products and product detail page
   * 
   * Test Steps:
   * 1. Launch browser
   * 2. Navigate to url 'http://automationexercise.com'
   * 3. Verify that home page is visible successfully
   * 4. Click on 'Products' button
   * 5. Verify user is navigated to ALL PRODUCTS page successfully
   * 6. The products list is visible
   * 7. Click on 'View Product' of first product
   * 8. User is landed to product detail page
   * 9. Verify that detail is visible: product name, category, price, availability, condition, brand
   */
  pageTest('TC008: Verify All Products and product detail page', async ({ homeHelper, productHelper, page, loc, core, sitemaps }) => {
        // Step 1, 2 & 3: Verify home page is visible successfully
        expect(await homeHelper.isHomePageVisible()).toBe(true);

        // Step 4: Navigate to Products page
        await productHelper.navigateToProducts();

        // Step 5: Verify user is navigated to ALL PRODUCTS page successfully
        expect(await productHelper.isProductsPageVisible()).toBe(true);

        // Step 6: The products list is visible
        const productsList = await core.getElement(sitemaps.products, 'Products', 'ProductsList');
        await expect(productsList).toBeVisible({ timeout: 10000 });

        // Step 7: Click on 'View Product' of first product
        await productHelper.viewFirstProduct();

        // Step 8: User is landed to product detail page
        const currentUrl = page.url();
        expect(currentUrl).toContain('/product_details/');

        // Step 9: Verify that detail is visible: product name, category, price, availability, condition, brand
        const productDetails = await productHelper.getProductDetails();
        
        // Verify all product details
        expect(productDetails.name.trim().length).toBeGreaterThan(0);
        expect(productDetails.category.trim()).toContain(loc.getValue('ResourcesStrings', 'Products.Category'));
        expect(productDetails.price.trim()).toContain(loc.getValue('ResourcesStrings', 'Products.PriceCurrency'));
        expect(productDetails.availability.trim()).toContain(loc.getValue('ResourcesStrings', 'Products.Availability'));
        expect(productDetails.condition.trim()).toContain(loc.getValue('ResourcesStrings', 'Products.Condition'));
        expect(productDetails.brand.trim()).toContain(loc.getValue('ResourcesStrings', 'Products.Brand'));

        // Log product details
        console.log(`\n✅ Product Details Verified:`);
        console.log(`   Name: ${productDetails.name}`);
        console.log(`   Category: ${productDetails.category}`);
        console.log(`   Price: ${productDetails.price}`);
        console.log(`   Availability: ${productDetails.availability}`);
        console.log(`   Condition: ${productDetails.condition}`);
        console.log(`   Brand: ${productDetails.brand}`);
      });

  /**
   * TC009: Search Product
   * 
   * Test Steps:
   * 1. Launch browser
   * 2. Navigate to url 'http://automationexercise.com'
   * 3. Verify that home page is visible successfully
   * 4. Click on 'Products' button
   * 5. Verify user is navigated to ALL PRODUCTS page successfully
   * 6. Enter product name in search input and click search button
   * 7. Verify 'SEARCHED PRODUCTS' is visible
   * 8. Verify all the products related to search are visible
   */
  pageTest('TC009: Search Product', async ({ homeHelper, productHelper, config, page, core, sitemaps }) => {
        // Step 1-3: Navigate to home and verify
        expect(await homeHelper.navigateAndVerifyHome()).toBe(true);

        // Step 4-5: Navigate to Products page and verify
        await productHelper.navigateToProducts();
        expect(await productHelper.isProductsPageVisible()).toBe(true);

        // Verify products list is visible
        const productsList = await core.getElement(sitemaps.products, 'Products', 'ProductsList');
        await expect(productsList).toBeVisible({ timeout: 10000 });

        // Step 6: Search for product
        const searchKeyword = config.products.searchKeyword;
        await productHelper.searchProduct(searchKeyword);

        // Step 7: Verify 'SEARCHED PRODUCTS' is visible
        expect(await productHelper.isSearchResultsVisible()).toBe(true);

        // Step 8: Verify all the products related to search are visible
        const searchResultsList = await core.getElement(sitemaps.products, 'Products', 'SearchResultsList');
        await expect(searchResultsList).toBeVisible({ timeout: 10000 });

        // Verify at least one product is displayed in search results
        const searchResults = await productHelper.getProductCount();
        expect(searchResults).toBeGreaterThan(0);

        // Verify product names contain the search keyword
        expect(await productHelper.searchResultsContainKeyword(searchKeyword)).toBe(true);

        // Get and log product names
        const productNames = await productHelper.getAllProductNames();
        console.log(`\n✅ Search completed successfully!`);
        console.log(`   Search Keyword: "${searchKeyword}"`);
        console.log(`   Products Found: ${searchResults}`);
        console.log(`   Product Names: ${productNames.join(', ')}`);
      });

  /**
   * TC012: Add Products in Cart
   * 
   * Test Steps:
   * 1. Launch browser
   * 2. Navigate to url 'http://automationexercise.com'
   * 3. Verify that home page is visible successfully
   * 4. Click 'Products' button
   * 5. Hover over first product and click 'Add to cart'
   * 6. Click 'Continue Shopping' button
   * 7. Hover over second product and click 'Add to cart'
   * 8. Click 'View Cart' button
   * 9. Verify both products are added to Cart
   * 10. Verify their prices, quantity and total price
   */
  pageTest('TC012: Add Products in Cart', async ({ homeHelper, productHelper, cartHelper, loc }) => {
        // Step 1-3: Navigate to home and verify
        expect(await homeHelper.navigateAndVerifyHome()).toBe(true);

        // Step 4: Navigate to Products page
        await productHelper.navigateToProducts();

        // Step 5-6: Add first product and continue shopping
        await productHelper.addFirstProductAndContinue();

        // Step 7-8: Add second product and view cart
        await productHelper.addSecondProductToCart();
        await productHelper.viewCartFromModal();

        // Step 9: Verify both products are added to Cart
        expect(await cartHelper.verifyCartItemCount(2)).toBe(true);

        // Step 10: Verify their prices, quantity and total price
        const verificationResults = await cartHelper.verifyMultipleProducts(2, loc.getValue('ResourcesStrings', 'Products.PriceCurrency'));
        
        // Assert all verifications passed
        expect(verificationResults.countMatch).toBe(true);
        verificationResults.products.forEach((product, index) => {
          expect(product.nameExists).toBe(true);
          expect(product.hasCurrency).toBe(true);
          expect(product.quantityIsOne).toBe(true);
          expect(product.priceEqualsTotal).toBe(true);
        });

        // Log cart summary
        await cartHelper.logCartSummary();
      });
    /**
     * TC013: Verify Product quantity in Cart
     *
     * Test Steps:
     * 1. Launch browser
     * 2. Navigate to url 'http://automationexercise.com'
     * 3. Verify that home page is visible successfully
     * 4. Click 'View Product' for any product on home page
     * 5. Verify product detail is opened
     * 6. Increase quantity to 4
     * 7. Click 'Add to cart' button
     * 8. Click 'View Cart' button
     * 9. Verify that product is displayed in cart page with exact quantity
     */
    pageTest('TC013: Verify Product quantity in Cart', async ({ homeHelper, productHelper, cartHelper, page, core, sitemaps }) => {
        // Step 1-3: Ensure home page is visible
        expect(await homeHelper.navigateAndVerifyHome()).toBe(true);

        // Step 4: Navigate to products and view first product
        await productHelper.navigateToProducts();
        await productHelper.viewFirstProduct();

        // Step 5: Verify product detail is opened
        expect(page.url()).toContain('/product_details/');
        const productName = await core.getElement(sitemaps.products, 'ProductDetail', 'ProductName');
        await expect(productName).toBeVisible({ timeout: 10000 });

        // Step 6-7: Increase quantity to 4 and add to cart
        await productHelper.addToCartFromDetailPage('4');

        // Step 8: View cart
        await productHelper.viewCartFromModal();

        // Step 9: Verify product is displayed in cart page with quantity 4
        expect(await cartHelper.verifyCartItemCount(1)).toBe(true);
        expect(await cartHelper.verifyProductQuantity(1, '4')).toBe(true);

        console.log(`\n✅ Product added to cart with quantity 4 successfully!`);
      });

      /**
       * TC014: Place Order - Register while Checkout
       *
       * Automates registration during checkout and completes order placement.
       */
    pageTest('TC014: Place Order - Register while Checkout', async ({ homeHelper, productHelper, cartHelper, core, loc, config, page, sitemaps }) => {
        // Step 1-3: Ensure home page is visible
        expect(await homeHelper.navigateAndVerifyHome()).toBe(true);

        // Step 4: Add products to cart
        await productHelper.navigateToProducts();
        await productHelper.addFirstProductAndContinue();

        // Step 5: Navigate to cart
        await homeHelper.navigateToCart();

        // Step 6: Verify cart page is displayed
        const cartHeading = await core.getElement(sitemaps.cart, 'Cart', 'CartPageHeading');
        await expect(cartHeading).toBeVisible({ timeout: 10000 });

        // Step 7-8: Click Proceed To Checkout and navigate to signup
        await cartHelper.proceedToCheckout();
        await core.waitForVisible(sitemaps.cart, 'Cart', 'RegisterOrLoginButton', 15000);
        await core.clickElement(sitemaps.cart, 'Cart', 'RegisterOrLoginButton');

        // Step 9: Fill all details in Signup and create account using config.json values
        const username = config.users.administrator.username;
        const timestamp = Date.now();
        const email = `testuser_${timestamp}@automation.com`;
        await core.fillText(sitemaps.login, 'Login', 'NewUserSignupNameInputBox', username);
        await core.fillText(sitemaps.login, 'Login', 'NewUserSignupEmailInputBox', email);
        await core.clickElement(sitemaps.login, 'Login', 'SignupButton');
        const accountInfoHeader = await core.getElement(sitemaps.login, 'Login', 'EnterAccountInformationTextField');
        await expect(accountInfoHeader).toBeVisible({ timeout: 10000 });
        const titleElement = config.users.administrator.title === 'Mr' ? 'MrRadioButton' : 'MrsRadioButton';
        await core.clickElement(sitemaps.login, 'Login', titleElement);
        await core.fillText(sitemaps.login, 'Login', 'PassowrdTextBox', config.users.administrator.password);
        await core.selectByValue(sitemaps.login, 'Login', 'DaysDropdown', config.users.administrator.dateOfBirth.day);
        await core.selectByValue(sitemaps.login, 'Login', 'MonthsDropdown', config.users.administrator.dateOfBirth.month);
        await core.selectByValue(sitemaps.login, 'Login', 'YearsDropdown', config.users.administrator.dateOfBirth.year);
        await core.fillText(sitemaps.login, 'Login', 'FirstNameTextBox', config.users.administrator.address.firstName);
        await core.fillText(sitemaps.login, 'Login', 'LastNameTextBox', config.users.administrator.address.lastName);
        await core.fillText(sitemaps.login, 'Login', 'CompanyTextBox', config.users.administrator.address.company);
        await core.fillText(sitemaps.login, 'Login', 'AddressTextBox', config.users.administrator.address.address1);
        await core.fillText(sitemaps.login, 'Login', 'Address2TextBox', config.users.administrator.address.address2);
        await core.selectByText(sitemaps.login, 'Login', 'CountryDropdown', config.users.administrator.address.country);
        await core.fillText(sitemaps.login, 'Login', 'StateTextBox', config.users.administrator.address.state);
        await core.fillText(sitemaps.login, 'Login', 'CityTextBox', config.users.administrator.address.city);
        await core.fillText(sitemaps.login, 'Login', 'ZipcodeTextBox', config.users.administrator.address.zipcode);
        await core.fillText(sitemaps.login, 'Login', 'MobileNumberTextBox', config.users.administrator.address.mobile);
        await core.clickElement(sitemaps.login, 'Login', 'CreateAccountButton');

        // Step 10: Verify 'ACCOUNT CREATED!' and click 'Continue' button
        const accountCreatedText = await core.getElement(sitemaps.login, 'Login', 'AccountCreatedTextField');
        await expect(accountCreatedText).toBeVisible({ timeout: 10000 });
        const accountCreatedMsg = await core.getText(sitemaps.login, 'Login', 'AccountCreatedTextField');
        expect(accountCreatedMsg).toContain(loc.getValue('ResourcesStrings', 'AccountCreation.SuccessTitle'));
        await core.clickElement(sitemaps.login, 'Login', 'ContinueButton');

        // Step 11: Verify 'Logged in as username' at top
        expect(await homeHelper.isUserLoggedIn(config.users.administrator.username)).toBe(true);

        // Step 12: Click 'Cart' button again
        await homeHelper.navigateToCart();

        // Step 13: Click 'Proceed To Checkout' button
        await cartHelper.proceedToCheckout();

        // Step 14: Verify Address Details and Review Your Order
        const addressDetails = await core.getElement(sitemaps.cart, 'Cart', 'AddressDetailsSection');
        await expect(addressDetails).toBeVisible({ timeout: 10000 });
        const orderReview = await core.getElement(sitemaps.cart, 'Cart', 'OrderReviewSection');
        await expect(orderReview).toBeVisible({ timeout: 10000 });

        // Step 15: Enter description in comment text area and click 'Place Order'
        await core.fillText(sitemaps.cart, 'Cart', 'OrderCommentTextArea', 'Test order placed during registration checkout.');
        await core.clickElement(sitemaps.cart, 'Cart', 'PlaceOrderButton');

        // Step 16: Enter payment details
        await core.fillText(sitemaps.cart, 'Cart', 'NameOnCardInput', 'Test User');
        await core.fillText(sitemaps.cart, 'Cart', 'CardNumberInput', '4111111111111111');
        await core.fillText(sitemaps.cart, 'Cart', 'CVCInput', '123');
        await core.fillText(sitemaps.cart, 'Cart', 'ExpirationMonthInput', '12');
        await core.fillText(sitemaps.cart, 'Cart', 'ExpirationYearInput', '2028');
        await core.clickElement(sitemaps.cart, 'Cart', 'PayAndConfirmOrderButton');

        // Step 18: Verify success message
        const orderSuccessMessage = await core.getElement(sitemaps.cart, 'Cart', 'OrderSuccessMessage');
        await expect(orderSuccessMessage).toBeVisible({ timeout: 10000 });
        const successText = await core.getText(sitemaps.cart, 'Cart', 'OrderSuccessMessage');
        expect(successText).toContain(loc.getValue('ResourcesStrings', 'Cart.OrderSuccessMessage'));

        // Step 19: Click 'Delete Account' button
        await core.clickElement(sitemaps.home, 'HomeScreen', 'DeleteAccountLinkOption');

        // Step 20: Verify 'ACCOUNT DELETED!' and click 'Continue' button
        const accountDeletedText = await core.getElement(sitemaps.login, 'Login', 'AccountDeletedTextField');
        await expect(accountDeletedText).toBeVisible({ timeout: 10000 });
        const accountDeletedMsg = await core.getText(sitemaps.login, 'Login', 'AccountDeletedTextField');
        expect(accountDeletedMsg).toContain(loc.getValue('ResourcesStrings', 'AccountDeletion.SuccessTitle'));
        await core.clickElement(sitemaps.login, 'Login', 'ContinueButton');
        console.log(`\n✅ Place Order with Register during Checkout completed successfully!`);
      });
});
