import productsPage from '../pageobjects/products.page.js';
import productDetailPage from '../pageobjects/product-detail.page.js';
import cartPage from '../pageobjects/cart.page.js';
import { COUPONS } from '../fixtures/testData.js';

describe('[WS-101] AC-1: Apply Coupon Code from Cart', () => {
    beforeEach(async () => {
        await cartPage.open();
        await cartPage.clearSession();
        // Add a product to cart to ensure basket is non-empty
        await productsPage.open();
        await productsPage.openProductDetails(0);
        await productDetailPage.addToCartAndGoToCart(1);
    });

    it('should display the coupon code input and apply button in the order summary', async () => {
        await expect(cartPage.couponInput).toBeDisplayed();
        await expect(cartPage.applyCouponButton).toBeDisplayed();
        await expect(cartPage.applyCouponButton).toBeClickable();
    });

    it('should allow a customer to enter and apply WARACLE25 from the cart', async () => {
        await cartPage.applyCoupon(COUPONS.VALID_WARACLE25);

        // Verify applied notice is visible
        await expect(cartPage.appliedCouponNotice).toBeDisplayed();
        await expect(cartPage.appliedCouponNotice).toHaveTextContaining(COUPONS.VALID_WARACLE25);

        // Verify order summary displays coupon discount line
        await expect(cartPage.couponDiscountRow).toBeDisplayed();
        await expect(cartPage.couponDiscountRow).toHaveTextContaining(`Coupon (${COUPONS.VALID_WARACLE25})`);

        // Verify discount amount is greater than 0
        const summary = await cartPage.getOrderSummary();
        expect(summary.discount).toBeGreaterThan(0);
    });
});
