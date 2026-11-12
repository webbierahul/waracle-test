import loginPage from '../pageobjects/login.page.js';
import productsPage from '../pageobjects/products.page.js';
import productDetailPage from '../pageobjects/product-detail.page.js';
import cartPage from '../pageobjects/cart.page.js';
import checkoutPage from '../pageobjects/checkout.page.js';
import orderSuccessPage from '../pageobjects/order-success.page.js';
import { COUPONS, USERS, CHECKOUT_CUSTOMER } from '../fixtures/testData.js';

describe('[WS-101] AC-6: Order Confirmation Reflects Coupon, Discount and Final Total', () => {
    beforeEach(async () => {
        await cartPage.open();
        await cartPage.clearSession();

        // 1. Add product to basket
        await productsPage.open();
        await productsPage.openProductDetails(0);
        await productDetailPage.addToCartAndGoToCart(1);
    });

    it('should carry applied coupon through checkout to order confirmation', async () => {
        // 1. Apply coupon in cart
        await cartPage.applyCoupon(COUPONS.VALID_WARACLE25);
        const cartSummary = await cartPage.getOrderSummary();
        expect(cartSummary.discount).toBeGreaterThan(0);

        // 2. Proceed to checkout (triggers authentication redirect)
        await cartPage.proceedToCheckoutButton.click();
        await loginPage.waitForUrlContains('/login');

        // 3. Sign in as demo user; router redirects back to /checkout
        await loginPage.login(USERS.DEMO.email, USERS.DEMO.password);
        await checkoutPage.waitForUrlContains('/checkout');

        // 4. Verify coupon discount is reflected on checkout screen
        const checkoutCouponText = await checkoutPage.getAppliedCouponText();
        expect(checkoutCouponText).toContain(COUPONS.VALID_WARACLE25);

        const checkoutTotal = await checkoutPage.getTotal();
        expect(checkoutTotal).toEqual(cartSummary.total);

        // 5. Fill remaining checkout details and submit order
        await checkoutPage.fillCheckoutDetails({
            ...CHECKOUT_CUSTOMER,
            fullName: `${USERS.DEMO.firstName} ${USERS.DEMO.lastName}`,
            email: USERS.DEMO.email,
        });
        await checkoutPage.submitOrder();

        // 6. Verify Order Confirmation (AC-6 requirements)
        const confirmation = await orderSuccessPage.getOrderConfirmationDetails();

        // Assertion 1: Valid generated order number
        expect(confirmation.orderNumber).toMatch(/^#?WS-2024-\d+/);

        // Assertion 2: Order confirmation shows the applied coupon code
        expect(confirmation.hasCouponRow).toBe(true);
        expect(confirmation.couponLabel).toContain(COUPONS.VALID_WARACLE25);

        // Assertion 3: Order confirmation reflects the exact discount amount
        expect(confirmation.discount).toEqual(cartSummary.discount);

        // Assertion 4: Order confirmation reflects the final total
        expect(confirmation.total).toEqual(cartSummary.total);
    });
});
