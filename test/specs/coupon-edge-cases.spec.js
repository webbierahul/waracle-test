import productsPage from '../pageobjects/products.page.js';
import productDetailPage from '../pageobjects/product-detail.page.js';
import cartPage from '../pageobjects/cart.page.js';
import { COUPONS } from '../fixtures/testData.js';
import { round2 } from '../helpers/currency.js';

describe('[WS-101] Coupon Codes — Edge Cases & Resilience', () => {
    beforeEach(async () => {
        await cartPage.open();
        await cartPage.clearSession();
        // Add a product to the cart
        await productsPage.open();
        await productsPage.openProductDetails(0);
        await productDetailPage.addToCartAndGoToCart(1);
    });

    it('should be case-insensitive: accept lowercase "waracle25"', async () => {
        await cartPage.applyCoupon(COUPONS.LOWERCASE_WARACLE25);

        const summary = await cartPage.getOrderSummary();
        expect(summary.isCouponRowVisible).toBe(true);
        expect(summary.discount).toBeGreaterThan(0);
    });

    it('should be case-insensitive: accept mixed case "Waracle25"', async () => {
        await cartPage.applyCoupon(COUPONS.MIXED_CASE_WARACLE25);

        const summary = await cartPage.getOrderSummary();
        expect(summary.isCouponRowVisible).toBe(true);
        expect(summary.discount).toBeGreaterThan(0);
    });

    it('should trim leading and trailing whitespace from coupon code input', async () => {
        await cartPage.applyCoupon(COUPONS.WITH_SPACES_WARACLE25);

        const summary = await cartPage.getOrderSummary();
        expect(summary.isCouponRowVisible).toBe(true);
        expect(summary.discount).toBeGreaterThan(0);
    });

    it('should reactively recalculate discount and total when item quantity is incremented', async () => {
        await cartPage.applyCoupon(COUPONS.VALID_WARACLE25);

        const initialSummary = await cartPage.getOrderSummary();

        // Increment quantity of first item
        await cartPage.incrementFirstItemQuantity();

        const updatedSummary = await cartPage.getOrderSummary();

        // Subtotal must increase
        expect(updatedSummary.subtotal).toBeGreaterThan(initialSummary.subtotal);

        // Total should stay mathematically consistent: subtotal - discount + shipping
        const expectedTotal = round2(updatedSummary.subtotal - updatedSummary.discount + updatedSummary.shipping);
        expect(updatedSummary.total).toEqual(expectedTotal);
    });

    it('should reset order summary state when the only cart item is removed', async () => {
        await cartPage.applyCoupon(COUPONS.VALID_WARACLE25);
        expect((await cartPage.getOrderSummary()).isCouponRowVisible).toBe(true);

        // Remove item from cart
        await cartPage.removeFirstItem();

        // Cart should now display empty state
        await expect(cartPage.emptyCartHeading).toBeDisplayed();
        await expect(cartPage.startShoppingButton).toBeDisplayed();
    });
});
