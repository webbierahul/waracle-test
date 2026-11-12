import Page from './page.js';
import { parseCurrency } from '../helpers/currency.js';

/**
 * Checkout Page Object.
 */
class CheckoutPage extends Page {
    async open() {
        await super.open('/checkout');
    }

    // Contact fields
    get emailInput() {
        return $('input[placeholder="john.doe@example.com"]');
    }

    get nameInput() {
        return $('input[placeholder="John Doe"]');
    }

    // Shipping address fields
    get addressInput() {
        return $('input[placeholder="10 Digital Drive"]');
    }

    get cityInput() {
        return $('input[placeholder="Edinburgh"]');
    }

    get postcodeInput() {
        return $('input[placeholder="EH1 1AA"]');
    }

    // Payment fields
    get cardNumberInput() {
        return $('input[placeholder="4242 4242 4242 4242"]');
    }

    get expiryInput() {
        return $('input[placeholder="12 / 26"]');
    }

    get cvcInput() {
        return $('input[placeholder="123"]');
    }

    get payButton() {
        return $('button.btn-accent');
    }

    // Summary elements on checkout
    get orderSummary() {
        return $$('.card')[1];
    }

    get couponRow() {
        return $('//div[span[contains(normalize-space(), "Coupon (")]]');
    }

    get totalRow() {
        return $('//div[span[normalize-space()="Total"]]');
    }

    /**
     * Fills out the checkout contact, shipping, and card details.
     * @param {object} customer
     */
    async fillCheckoutDetails(customer) {
        await this.addressInput.waitForDisplayed();

        await browser.execute((cust) => {
            function setField(selector, val) {
                const el = document.querySelector(selector);
                if (!el) return;
                const protoSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                if (protoSetter) {
                    protoSetter.call(el, val);
                } else {
                    el.value = val;
                }
                const propsKey = Object.keys(el).find(k => k.startsWith('__reactProps'));
                if (propsKey && el[propsKey]?.onChange) {
                    el[propsKey].onChange({ target: { value: val }, currentTarget: { value: val } });
                }
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }

            if (cust.email) setField('input[placeholder="john.doe@example.com"]', cust.email);
            if (cust.fullName) setField('input[placeholder="John Doe"]', cust.fullName);
            setField('input[placeholder="10 Digital Drive"]', cust.address);
            setField('input[placeholder="Edinburgh"]', cust.city);
            setField('input[placeholder="EH1 1AA"]', cust.postcode);
            setField('input[placeholder="4242 4242 4242 4242"]', cust.cardNumber);
            setField('input[placeholder="12 / 26"]', cust.expiry);
            setField('input[placeholder="123"]', cust.cvc);
        }, customer);

        await browser.pause(300);
    }

    /**
     * Submits the order and waits for the order success page.
     */
    async submitOrder() {
        await browser.execute(() => {
            const btn = document.querySelector('button.btn-accent.w-full');
            if (btn) btn.click();
        });

        await this.waitForUrlContains('/order-success');
    }

    /**
     * Reads the coupon text shown in the checkout order summary.
     */
    async getAppliedCouponText() {
        if (await this.couponRow.isDisplayed()) {
            return await this.couponRow.getText();
        }
        return '';
    }

    /**
     * Reads the final total shown on the checkout page.
     */
    async getTotal() {
        await this.totalRow.waitForDisplayed();
        const spans = await this.totalRow.$$('span');
        return parseCurrency(await spans[1].getText());
    }
}

export default new CheckoutPage();
