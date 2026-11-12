/**
 * Header navigation bar component accessible across screens.
 */
class NavbarComponent {
    get brandLogo() {
        return $('header a[aria-label="Waracle home"]');
    }

    get cartLink() {
        return $('header a[aria-label="Cart"]');
    }

    get cartBadge() {
        return $('header a[aria-label="Cart"] span');
    }

    get accountLink() {
        return $('header button[aria-label="Account"]');
    }

    get userGreeting() {
        return $('header span.text-gray-600');
    }

    get signOutButton() {
        return $('header button=Sign out');
    }

    get searchInput() {
        return $('input[data-test-id="search-input"]');
    }

    /**
     * Retrieves the numeric badge count showing in the cart icon.
     * Returns 0 if no badge is visible.
     */
    async getCartBadgeCount() {
        if (await this.cartBadge.isDisplayed()) {
            const txt = await this.cartBadge.getText();
            return parseInt(txt, 10) || 0;
        }
        return 0;
    }

    async goToCart() {
        await this.cartLink.click();
    }
}

export default new NavbarComponent();
