/**
 * Test Case 11: Verify Subscription in Cart page
 * 
 * This test verifies the subscription functionality on the Cart page footer.
 * It validates that users can subscribe to the newsletter from the Cart page.
 * 
 * Test Steps:
 * 1. Launch browser
 * 2. Navigate to url 'http://automationexercise.com'
 * 3. Verify that home page is visible successfully
 * 4. Click 'Cart' button
 * 5. Scroll down to footer
 * 6. Verify text 'SUBSCRIPTION'
 * 7. Enter email address in input and click arrow button
 * 8. Verify success message 'You have been successfully subscribed!' is visible
 */

const { test: pageTest, expect } = require('../../src/fixtures/pageFixtures');

pageTest.describe('Verify Subscription in Cart page', () => {

    pageTest('TC011: Verify Subscription in Cart page', async ({ homeHelper, cartHelper, core, loc, config, page, sitemaps }) => {
        // Step 1-3: Verify home page is visible
        expect(await homeHelper.isHomePageVisible()).toBe(true);

        // Step 4: Navigate to cart page
        await homeHelper.navigateToCart();

        // Step 5-6: Scroll down and verify 'SUBSCRIPTION' heading
        await core.scrollIntoView(sitemaps.home, 'HomeScreen', 'SubscriptionHeading');
        const subscriptionHeading = await core.getElement(sitemaps.home, 'HomeScreen', 'SubscriptionHeading');
        await expect(subscriptionHeading).toBeVisible({ timeout: 10000 });

        const headingText = await core.getText(sitemaps.home, 'HomeScreen', 'SubscriptionHeading');
        const expectedHeading = loc.getValue('ResourcesStrings', 'Subscription.Heading');
        expect(headingText.trim()).toBe(expectedHeading);

        // Step 7-8: Subscribe and verify success message
        const subscriptionEmail = config.subscription.email;
        await core.fillText(sitemaps.home, 'HomeScreen', 'SubscriptionEmailInput', subscriptionEmail);
        await core.clickElement(sitemaps.home, 'HomeScreen', 'SubscribeButton');
        await page.waitForTimeout(2000);

        const successMessage = await core.getElement(sitemaps.home, 'HomeScreen', 'SubscriptionSuccessMessage');
        await expect(successMessage).toHaveCount(1, { timeout: 10000 });

        const successMessageText = await core.getTextContent(sitemaps.home, 'HomeScreen', 'SubscriptionSuccessMessage');
        const expectedSuccessMessage = loc.getValue('ResourcesStrings', 'Subscription.SuccessMessage');
        expect(successMessageText.trim()).toBe(expectedSuccessMessage);

        console.log(`\n✅ Subscription in Cart page completed successfully!`);
        console.log(`   Email: "${subscriptionEmail}"`);
        console.log(`   Success Message: "${successMessageText.trim()}"`);
    });
});
