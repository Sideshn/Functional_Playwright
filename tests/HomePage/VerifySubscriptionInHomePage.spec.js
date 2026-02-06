/**
 * Test Case 10: Verify Subscription in home page
 * 
 * This test verifies the subscription functionality on the home page footer.
 * It validates that users can subscribe to the newsletter from the home page.
 * 
 * Test Steps:
 * 1. Launch browser
 * 2. Navigate to url 'http://automationexercise.com'
 * 3. Verify that home page is visible successfully
 * 4. Scroll down to footer
 * 5. Verify text 'SUBSCRIPTION'
 * 6. Enter email address in input and click arrow button
 * 7. Verify success message 'You have been successfully subscribed!' is visible
 */

const { test: pageTest, expect } = require('../../src/fixtures/pageFixtures');

pageTest.describe('Verify Subscription in home page', () => {

    pageTest('TC010: Verify Subscription in home page', async ({ homeHelper, core, loc, config, page, sitemaps }) => {
        // Step 1-3: Verify home page is visible
        expect(await homeHelper.isHomePageVisible()).toBe(true);

        // Step 4-5: Scroll down and verify 'SUBSCRIPTION' heading
        await core.scrollIntoView(sitemaps.home, 'HomeScreen', 'SubscriptionHeading');
        const subscriptionHeading = await core.getElement(sitemaps.home, 'HomeScreen', 'SubscriptionHeading');
        await expect(subscriptionHeading).toBeVisible({ timeout: 10000 });

        const headingText = await core.getText(sitemaps.home, 'HomeScreen', 'SubscriptionHeading');
        const expectedHeading = loc.getValue('ResourcesStrings', 'Subscription.Heading');
        expect(headingText.trim()).toBe(expectedHeading);

        // Step 6-7: Subscribe and verify success message
        const subscriptionEmail = config.subscription.email;
        await homeHelper.subscribeToNewsletter(subscriptionEmail);
        await page.waitForTimeout(2000);

        const successMessage = await core.getElement(sitemaps.home, 'HomeScreen', 'SubscriptionSuccessMessage');
        await expect(successMessage).toHaveCount(1, { timeout: 10000 });

        const successMessageText = await core.getTextContent(sitemaps.home, 'HomeScreen', 'SubscriptionSuccessMessage');
        const expectedSuccessMessage = loc.getValue('ResourcesStrings', 'Subscription.SuccessMessage');
        expect(successMessageText.trim()).toBe(expectedSuccessMessage);

        console.log(`\n✅ Subscription completed successfully!`);
        console.log(`   Email: "${subscriptionEmail}"`);
        console.log(`   Success Message: "${successMessageText.trim()}"`);
    });
});
