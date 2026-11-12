import Page from './page.js';
import { parseCurrency } from '../helpers/currency.js';

/**
 * Shopping Cart Page Object.
 * Encapsulates the coupon input, basket items, and order summary breakdown.
 */
class CartPage extends Page {
    async open() {
        await super.open('/cart');
    }

    get heading() {
        return $('h1=Shopping Cart');
    }

    get emptyCartHeading() {
        return $('h1=Your cart is empty');
    }

    get startShoppingButton() {
        return $('a=Start Shopping');
    }

    // Basket items
    get cartItems() {
        return $$('.space-y-4 > div.card');
    }

    get itemRemoveButtons() {
        return $$('button=Remove');
    }

    get itemIncrementButtons() {
        return $$('//div[contains(@class, "space-y-4")]//button[normalize-space()="+"]');
    }

    get itemDecrementButtons() {
        return $$('//div[contains(@class, "space-y-4")]//button[normalize-space()="–"]');
    }

    get itemQuantities() {
        return $$('//div[contains(@class, "space-y-4")]//span[contains(@class, "w-8")]');
    }

    // Coupon code section
    get couponInput() {
        return $('input[placeholder="e.g. WARACLE25"]');
    }

    get applyCouponButton() {
        return $('button=Apply');
    }

    get appliedCouponNotice() {
        return $('p.text-xs.text-obsidian');
    }

    // Order Summary breakdown rows
    get summaryCard() {
        return $('aside.card');
    }

    get subtotalRow() {
        return this.summaryCard.$('//div[span[normalize-space()="Subtotal"]]');
    }

    get couponDiscountRow() {
        return this.summaryCard.$('//div[span[contains(normalize-space(), "Coupon (")]]');
    }

    get shippingRow() {
        return this.summaryCard.$('//div[span[normalize-space()="Shipping"]]');
    }

    get totalRow() {
        return this.summaryCard.$('//div[span[normalize-space()="Total"]]');
    }

    get proceedToCheckoutButton() {
        return $('button=Proceed to Checkout');
    }

    get continueShoppingLink() {
        return $('a=Continue shopping');
    }

    /**
     * Enters a coupon code into the input field and clicks the Apply button.
     * @param {string} code - The coupon code to apply
     */
    async applyCoupon(code) {
        await this.couponInput.waitForDisplayed();
        // Clear existing value by setting value to empty or backspacing
        await this.couponInput.click();
        await browser.keys(['Control', 'a']);
        await browser.keys(['Meta', 'a']);
        await browser.keys('Backspace');
        if (code) {
            await this.couponInput.setValue(code);
        }
        await this.applyCouponButton.waitForClickable();
        await this.applyCouponButton.click();

        // If a valid coupon was applied, wait for the discount line to appear in the summary
        if (code && code.trim().toUpperCase() === 'WARACLE25') {
            await this.couponDiscountRow.waitForDisplayed({
                timeout: 5000,
                timeoutMsg: 'Expected coupon discount row to display in order summary after applying WARACLE25'
            });
        } else {
            // Allow mock API delay to complete for negative/empty cases
            await browser.pause(500);
        }
    }

    /**
     * Retrieves the numeric subtotal from the Order Summary.
     * @returns {Promise<number>}
     */
    async getSubtotal() {
        await this.subtotalRow.waitForDisplayed();
        const valueSpan = await this.subtotalRow.$$('span')[1];
        return parseCurrency(await valueSpan.getText());
    }

    /**
     * Retrieves the applied discount amount from the Order Summary.
     * Returns 0 if no discount row is visible.
     * @returns {Promise<number>}
     */
    async getDiscount() {
        if (await this.couponDiscountRow.isDisplayed()) {
            const valueSpan = await this.couponDiscountRow.$$('span')[1];
            return parseCurrency(await valueSpan.getText());
        }
        return 0;
    }

    /**
     * Retrieves the shipping cost from the Order Summary.
     * @returns {Promise<number>}
     */
    async getShipping() {
        await this.shippingRow.waitForDisplayed();
        const valueSpan = await this.shippingRow.$$('span')[1];
        return parseCurrency(await valueSpan.getText());
    }

    /**
     * Retrieves the grand total from the Order Summary.
     * @returns {Promise<number>}
     */
    async getTotal() {
        await this.totalRow.waitForDisplayed();
        const valueSpan = await this.totalRow.$$('span')[1];
        return parseCurrency(await valueSpan.getText());
    }

    /**
     * Snapshot object of the entire Order Summary section for assertions.
     */
    async getOrderSummary() {
        const subtotal = await this.getSubtotal();
        const discount = await this.getDiscount();
        const shipping = await this.getShipping();
        const total = await this.getTotal();
        const isCouponRowVisible = await this.couponDiscountRow.isDisplayed();
        const isNoticeVisible = await this.appliedCouponNotice.isDisplayed();
        const appliedNoticeText = isNoticeVisible ? await this.appliedCouponNotice.getText() : '';

        return {
            subtotal,
            discount,
            shipping,
            total,
            isCouponRowVisible,
            appliedNoticeText,
        };
    }

    /**
     * Removes the first item currently in the cart.
     */
    async removeFirstItem() {
        const buttons = await this.itemRemoveButtons;
        if (buttons.length > 0) {
            await buttons[0].click();
            await browser.pause(250);
        }
    }

    /**
     * Increments the quantity of the first item in the cart.
     */
    async incrementFirstItemQuantity() {
        const buttons = await this.itemIncrementButtons;
        if (buttons.length > 0) {
            await buttons[0].click();
            await browser.pause(350);
        }
    }

    /**
     * Clicks "Proceed to Checkout".
     */
    async proceedToCheckout() {
        await this.proceedToCheckoutButton.waitForClickable();
        await this.proceedToCheckoutButton.click();
        await this.waitForUrlContains('/checkout');
    }
}

export default new CartPage();
