import { Given, When, Then, Before, AfterStep } from '@wdio/cucumber-framework';
import cucumberJson from 'wdio-cucumberjs-json-reporter';
import cartPage from '../../test/pageobjects/cart.page.js';
import productsPage from '../../test/pageobjects/products.page.js';
import productDetailPage from '../../test/pageobjects/product-detail.page.js';
import loginPage from '../../test/pageobjects/login.page.js';
import checkoutPage from '../../test/pageobjects/checkout.page.js';
import orderSuccessPage from '../../test/pageobjects/order-success.page.js';
import { USERS, CHECKOUT_CUSTOMER } from '../../test/fixtures/testData.js';
import { round2, parseCurrency } from '../../test/helpers/currency.js';

Before(async function () {
    await cartPage.open();
    await cartPage.clearSession();
});

AfterStep(async function (step) {
    if (step.result && step.result.status === 'FAILED') {
        try {
            const screenshot = await browser.takeScreenshot();
            cucumberJson.attach(screenshot, 'image/png');
        } catch (err) {
            // Safe screenshot capture
        }
    }
});

/* -------------------------------------------------------------------------- */
/*                                GIVEN STEPS                                 */
/* -------------------------------------------------------------------------- */

Given('the customer has added a product to the cart', async function () {
    await productsPage.open();
    await productsPage.openProductDetails(0);
    await productDetailPage.addToCartAndGoToCart(1);
});

Given('the customer has added a product with price {string} to the cart', async function (_price) {
    await productsPage.open();
    await productsPage.openProductDetails(0);
    await productDetailPage.addToCartAndGoToCart(1);
});

Given('the customer has added {int} items of a product to the cart', async function (qty) {
    await productsPage.open();
    await productsPage.openProductDetails(0);
    await productDetailPage.addToCartAndGoToCart(qty);
});

Given('the customer has an empty cart', async function () {
    await cartPage.open();
    await cartPage.clearSession();
    await cartPage.open();
});

Given('the customer is on the cart page', async function () {
    await expect(cartPage.heading).toBeDisplayed();
});

/* -------------------------------------------------------------------------- */
/*                                 WHEN STEPS                                 */
/* -------------------------------------------------------------------------- */

When('the customer applies coupon code {string}', async function (code) {
    this.initialToastCount = (await $$('div.animate-toast-in')).length;
    await cartPage.applyCoupon(code);
});

When('the customer applies an empty coupon code', async function () {
    this.initialToastCount = (await $$('div.animate-toast-in')).length;
    await cartPage.applyCoupon('');
});

When('the customer adds another product to the cart', async function () {
    await productsPage.open();
    await productsPage.openProductDetails(1);
    await productDetailPage.addToCartAndGoToCart(1);
});

When('the customer increments the item quantity', async function () {
    this.previousSubtotal = (await cartPage.getOrderSummary()).subtotal;
    await cartPage.incrementFirstItemQuantity();
});

When('the customer removes the item from the cart', async function () {
    await cartPage.removeFirstItem();
});

When('the customer proceeds to checkout and signs in as {string}', async function (email) {
    this.cartSummary = await cartPage.getOrderSummary();
    await cartPage.proceedToCheckoutButton.click();
    await loginPage.waitForUrlContains('/login');
    await loginPage.login(email, USERS.DEMO.password);
    await checkoutPage.waitForUrlContains('/checkout');
});

When('the customer completes checkout with valid customer and payment details', async function () {
    this.checkoutTotal = await checkoutPage.getTotal();
    await checkoutPage.fillCheckoutDetails({
        ...CHECKOUT_CUSTOMER,
        fullName: `${USERS.DEMO.firstName} ${USERS.DEMO.lastName}`,
        email: USERS.DEMO.email,
    });
    await checkoutPage.submitOrder();
});

/* -------------------------------------------------------------------------- */
/*                                 THEN STEPS                                 */
/* -------------------------------------------------------------------------- */

Then('the coupon input field should be displayed', async function () {
    await expect(cartPage.couponInput).toBeDisplayed();
});

Then('the apply coupon button should be visible and clickable', async function () {
    await expect(cartPage.applyCouponButton).toBeDisplayed();
    await expect(cartPage.applyCouponButton).toBeClickable();
});

Then('the applied coupon notice should show {string}', async function (code) {
    await expect(cartPage.appliedCouponNotice).toBeDisplayed();
    await expect(cartPage.appliedCouponNotice).toHaveTextContaining(code);
});

Then('the order summary should display a coupon discount row for {string}', async function (code) {
    await expect(cartPage.couponDiscountRow).toBeDisplayed();
    await expect(cartPage.couponDiscountRow).toHaveTextContaining(code);
});

Then('the discount amount should be greater than £0.00', async function () {
    const summary = await cartPage.getOrderSummary();
    expect(summary.discount).toBeGreaterThan(0);
});

Then('a discount deduction should appear in the order summary', async function () {
    const summary = await cartPage.getOrderSummary();
    expect(summary.isCouponRowVisible).toBe(true);
    expect(summary.discount).toBeGreaterThan(0);
});

Then('the order total should be reduced by the applied discount', async function () {
    const summary = await cartPage.getOrderSummary();
    const expectedTotal = round2(summary.subtotal - summary.discount + summary.shipping);
    expect(summary.total).toEqual(expectedTotal);
});

Then('the discount amount should be exactly 25% of the subtotal', async function () {
    const summary = await cartPage.getOrderSummary();
    const expectedPercentageDiscount = round2(summary.subtotal * 0.25);
    // Directly asserts 25% per AC-2 (will fail on WS-DEFECT-01 where discount = £0.25 flat)
    expect(summary.discount).toEqual(expectedPercentageDiscount);
});

Then('the empty cart message should be displayed', async function () {
    await expect(cartPage.emptyCartHeading).toBeDisplayed();
    await expect(cartPage.startShoppingButton).toBeDisplayed();
});

Then('no shipping charge should be applied', async function () {
    const isDisplayed = await cartPage.shippingRow.isDisplayed().catch(() => false);
    expect(isDisplayed).toBe(false);
});

Then('the shipping cost should be {string}', async function (expectedShippingStr) {
    const shipping = await cartPage.getShipping();
    const expectedShipping = parseCurrency(expectedShippingStr);
    expect(shipping).toEqual(expectedShipping);
});

Then('the order total should equal subtotal plus shipping', async function () {
    const summary = await cartPage.getOrderSummary();
    const expectedTotal = round2(summary.subtotal + summary.shipping);
    expect(summary.discount).toEqual(0);
    expect(summary.total).toEqual(expectedTotal);
});

Then('the order total should equal subtotal minus discount plus shipping', async function () {
    const summary = await cartPage.getOrderSummary();
    const expectedTotal = round2(summary.subtotal - summary.discount + summary.shipping);
    expect(summary.total).toEqual(expectedTotal);
});

Then('no discount should be applied', async function () {
    const summary = await cartPage.getOrderSummary();
    expect(summary.discount).toEqual(0);
});

Then('the coupon discount row should not be visible', async function () {
    const summary = await cartPage.getOrderSummary();
    expect(summary.isCouponRowVisible).toBe(false);
});

Then('a clear error message indicating an invalid coupon should be displayed', async function () {
    const latestToast = $('(//div[contains(@class, "animate-toast-in")])[last()]');
    await latestToast.waitForDisplayed({ timeout: 4000 });
    const text = (await latestToast.getText()).toLowerCase();
    // AC-5 requires a clear error message; SUT displays neutral info "Coupon entered" so this fails as defect WS-DEFECT-02
    expect(text).toContain('invalid');
});

Then('a validation message should be displayed', async function () {
    // AC-5 requires a clear message on empty code; SUT performs silent return with no feedback so this fails as defect WS-DEFECT-02
    const currentToastCount = (await $$('div.animate-toast-in')).length;
    const hasNewToast = currentToastCount > (this.initialToastCount || 0);
    expect(hasNewToast).toBe(true);
});

Then('the subtotal should increase', async function () {
    const currentSubtotal = (await cartPage.getOrderSummary()).subtotal;
    expect(currentSubtotal).toBeGreaterThan(this.previousSubtotal);
});

Then('the order confirmation screen should display a valid order number', async function () {
    this.confirmation = await orderSuccessPage.getOrderConfirmationDetails();
    expect(this.confirmation.orderNumber).toMatch(/^#?WS-2024-\d+/);
});

Then('the order confirmation should display applied coupon {string}', async function (coupon) {
    expect(this.confirmation.hasCouponRow).toBe(true);
    expect(this.confirmation.couponLabel).toContain(coupon);
});

Then('the order confirmation discount should match the cart discount', async function () {
    expect(this.confirmation.discount).toEqual(this.cartSummary.discount);
});

Then('the order confirmation total should match the checkout total', async function () {
    expect(this.confirmation.total).toEqual(this.checkoutTotal);
});
