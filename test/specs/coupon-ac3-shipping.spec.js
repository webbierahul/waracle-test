import productsPage from '../pageobjects/products.page.js';
import productDetailPage from '../pageobjects/product-detail.page.js';
import cartPage from '../pageobjects/cart.page.js';
import { COUPONS, PRICING } from '../fixtures/testData.js';

describe('[WS-101] AC-3: Standard £5.00 Shipping on Non-Empty Basket', () => {
    beforeEach(async () => {
        await cartPage.open();
        await cartPage.clearSession();
    });

    it('should show empty cart state without shipping charge when cart is empty', async () => {
        await cartPage.open();
        await expect(cartPage.emptyCartHeading).toBeDisplayed();
        await expect(cartPage.startShoppingButton).toBeDisplayed();
    });

    it('should apply exactly £5.00 standard shipping to a single-item basket', async () => {
        await productsPage.open();
        await productsPage.openProductDetails(0);
        await productDetailPage.addToCartAndGoToCart(1);

        const shipping = await cartPage.getShipping();
        expect(shipping).toEqual(PRICING.STANDARD_SHIPPING);
    });

    it('should maintain £5.00 flat shipping when multiple items/quantities are in the basket', async () => {
        await productsPage.open();
        await productsPage.openProductDetails(0);
        await productDetailPage.addToCartAndGoToCart(3);

        const shipping = await cartPage.getShipping();
        expect(shipping).toEqual(PRICING.STANDARD_SHIPPING);
    });

    it('should not alter the £5.00 shipping cost when WARACLE25 coupon is applied', async () => {
        await productsPage.open();
        await productsPage.openProductDetails(0);
        await productDetailPage.addToCartAndGoToCart(1);

        const shippingBefore = await cartPage.getShipping();
        expect(shippingBefore).toEqual(PRICING.STANDARD_SHIPPING);

        await cartPage.applyCoupon(COUPONS.VALID_WARACLE25);

        const shippingAfter = await cartPage.getShipping();
        expect(shippingAfter).toEqual(PRICING.STANDARD_SHIPPING);
    });
});
