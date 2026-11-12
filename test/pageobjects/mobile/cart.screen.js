/**
 * Appium Screen Object for the Mobile React Native Cart Screen.
 * Demonstrates cross-platform extendability using the exact testIDs embedded
 * in qa-candidate-test/mobile/src/screens/CartScreen.tsx.
 */
class CartScreen {
    // Accessibility ID selectors (~testID in WebDriverIO)
    get couponInput() {
        return $('~cart_coupon_input');
    }

    get applyButton() {
        return $('~cart_apply_button');
    }

    get proceedButton() {
        return $('~cart_proceed_button');
    }

    get startShoppingButton() {
        return $('~cart_start_shopping_button');
    }

    /**
     * Enters a coupon code and taps Apply on native mobile.
     * @param {string} code
     */
    async applyCoupon(code) {
        await this.couponInput.waitForDisplayed();
        await this.couponInput.setValue(code);
        await this.applyButton.click();
    }

    /**
     * Taps "Proceed to Checkout" on mobile.
     */
    async proceedToCheckout() {
        await this.proceedButton.waitForClickable();
        await this.proceedButton.click();
    }
}

export default new CartScreen();
