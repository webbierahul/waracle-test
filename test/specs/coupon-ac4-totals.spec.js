import productsPage from '../pageobjects/products.page.js';
import productDetailPage from '../pageobjects/product-detail.page.js';
import cartPage from '../pageobjects/cart.page.js';
import { COUPONS } from '../fixtures/testData.js';
import { round2 } from '../helpers/currency.js';

describe('[WS-101] AC-4: Order Total Calculation Formula', () => {
    beforeEach(async () => {
        await cartPage.open();
        await cartPage.clearSession();
    });

    it('should correctly calculate total as subtotal + shipping when no coupon is applied', async () => {
        await productsPage.open();
        await productsPage.openProductDetails(0);
        await productDetailPage.addToCartAndGoToCart(1);

        const summary = await cartPage.getOrderSummary();
        const expectedTotal = round2(summary.subtotal + summary.shipping);

        expect(summary.discount).toEqual(0);
        expect(summary.total).toEqual(expectedTotal);
    });

    it('should strictly satisfy the formula (total = subtotal − discount + shipping) when WARACLE25 is applied', async () => {
        await productsPage.open();
        await productsPage.openProductDetails(0);
        await productDetailPage.addToCartAndGoToCart(1);

        await cartPage.applyCoupon(COUPONS.VALID_WARACLE25);

        const summary = await cartPage.getOrderSummary();
        const calculatedTotal = round2(summary.subtotal - summary.discount + summary.shipping);

        expect(summary.discount).toBeGreaterThan(0);
        expect(summary.total).toEqual(calculatedTotal);
    });

    it('should maintain mathematical consistency with multiple items and quantities', async () => {
        await productsPage.open();
        await productsPage.openProductDetails(0);
        await productDetailPage.addToCart(2);

        // Add second distinct item
        await productsPage.open();
        await productsPage.openProductDetails(1);
        await productDetailPage.addToCartAndGoToCart(1);

        await cartPage.applyCoupon(COUPONS.VALID_WARACLE25);

        const summary = await cartPage.getOrderSummary();
        const expectedTotal = round2(summary.subtotal - summary.discount + summary.shipping);

        expect(summary.total).toEqual(expectedTotal);
    });
});
