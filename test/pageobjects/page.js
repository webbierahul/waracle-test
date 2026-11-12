/**
 * Base Page Object containing common properties and methods shared across all pages.
 */
export default class Page {
    /**
     * Navigates to a path relative to the baseUrl.
     * @param {string} path - Relative URL path (e.g. '/cart')
     */
    async open(path = '') {
        await browser.url(path);
    }

    /**
     * Selector for the floating toast notification.
     */
    get toast() {
        return $('div.animate-toast-in');
    }

    /**
     * Waits for a toast notification to appear and returns its text content.
     * @param {number} timeout - Maximum wait time in ms
     * @returns {Promise<string>}
     */
    async getToastMessage(timeout = 5000) {
        await this.toast.waitForDisplayed({ timeout });
        return await this.toast.getText();
    }

    /**
     * Resets local storage and session data to guarantee test isolation.
     */
    async clearSession() {
        await browser.execute(() => {
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch (e) {
                // Ignore if storage is inaccessible
            }
        });
    }

    /**
     * Helper to wait until the browser URL contains a specific subpath.
     * @param {string} subpath
     * @param {number} timeout
     */
    async waitForUrlContains(subpath, timeout = 10000) {
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes(subpath),
            {
                timeout,
                timeoutMsg: `Expected URL to include "${subpath}" within ${timeout}ms, got "${await browser.getUrl()}"`,
            }
        );
    }
}
