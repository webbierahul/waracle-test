import Page from './page.js';
import { parseCurrency } from '../helpers/currency.js';

/**
 * Order Confirmation / Success Page Object.
 * Used for verifying AC-6.
 */
class OrderSuccessPage extends Page {
    get successHeading() {
        return $('h1=Thank you for your order!');
    }

    get orderNumber() {
        return $('//p[normalize-space()="Order Number"]/following-sibling::p');
    }

    get totalPaid() {
        return $('//p[normalize-space()="Total Paid"]/following-sibling::p');
    }

    get couponDiscountRow() {
        return $('//div[span[contains(normalize-space(), "Coupon (")]]');
    }

    get continueShoppingButton() {
        return $('button=Continue Shopping');
    }

    async getOrderConfirmationDetails() {
        await this.successHeading.waitForDisplayed({ timeout: 10000 });
        const orderNumber = await this.orderNumber.getText();
        const total = parseCurrency(await this.totalPaid.getText());
        const hasCouponRow = await this.couponDiscountRow.isDisplayed();
        let couponLabel = '';
        let discount = 0;

        if (hasCouponRow) {
            const spans = await this.couponDiscountRow.$$('span');
            couponLabel = await spans[0].getText();
            discount = parseCurrency(await spans[1].getText());
        }

        return {
            orderNumber,
            total,
            hasCouponRow,
            couponLabel,
            discount,
        };
    }
}

export default new OrderSuccessPage();
