import Page from './page.js';

/**
 * Product Catalogue page object.
 */
class ProductsPage extends Page {
    async open() {
        await super.open('/products');
        await this.heading.waitForDisplayed();
    }

    get heading() {
        return $('h1=All Products');
    }

    get productCards() {
        return $$('a[href^="/products/"]');
    }

    /**
     * Clicks on a product card by zero-based index to navigate to its details page.
     * @param {number} index
     */
    async openProductDetails(index = 0) {
        await $('a[href^="/products/"]').waitForDisplayed({ timeout: 5000 });
        const cards = await this.productCards;
        if (!cards.length) {
            throw new Error('No product cards found on the products page.');
        }
        const card = cards[index];
        await card.waitForClickable({ timeout: 5000 });
        await card.click();
        // Wait for React router transition to product details
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/products/'),
            { timeout: 5000, timeoutMsg: 'Expected navigation to /products/:id after clicking product card' }
        );
    }
}

export default new ProductsPage();
