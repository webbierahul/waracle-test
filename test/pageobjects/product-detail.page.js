import Page from './page.js';

/**
 * Product Details page object.
 */
class ProductDetailPage extends Page {
    async open(id = 'p-mens-tee') {
        await super.open(`/products/${id}`);
        await this.productName.waitForDisplayed({ timeout: 10000 });
    }

    get productName() {
        return $('h1.text-3xl');
    }

    get productPrice() {
        return $('p.text-2xl.font-bold');
    }

    get addToCartButton() {
        return $('button=Add to Cart');
    }

    get viewCartButton() {
        return $('a=View Cart');
    }

    get qtyPlusButton() {
        return $('button=+');
    }

    get qtyMinusButton() {
        return $('button=–');
    }

    get qtyValue() {
        return $('span.w-10');
    }

    /**
     * Adds the current product to cart and clicks "View Cart".
     * @param {number} quantity - Desired quantity to add
     */
    async addToCart(quantity = 1) {
        await this.productName.waitForDisplayed({ timeout: 10000 });
        await this.addToCartButton.waitForClickable({ timeout: 10000 });

        // Increment quantity if greater than default 1
        if (quantity > 1) {
            for (let i = 1; i < quantity; i++) {
                await this.qtyPlusButton.click();
            }
        }

        await this.addToCartButton.click();
        await browser.pause(300);
    }

    async addToCartAndGoToCart(quantity = 1) {
        await this.addToCart(quantity);
        await this.viewCartButton.waitForClickable({ timeout: 5000 });
        await this.viewCartButton.click();
        await $('h1=Shopping Cart').waitForDisplayed({ timeout: 5000 });
    }
}

export default new ProductDetailPage();
