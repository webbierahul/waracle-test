import Page from './page.js';

/**
 * Login Page Object.
 */
class LoginPage extends Page {
    async open() {
        await super.open('/login');
    }

    get emailInput() {
        return $('#email');
    }

    get passwordInput() {
        return $('#password');
    }

    get signInButton() {
        return $('button[type="submit"]');
    }

    /**
     * Authenticates using email and password credentials.
     * @param {string} email
     * @param {string} password
     */
    async login(email, password) {
        await this.emailInput.waitForDisplayed();
        await this.emailInput.setValue(email);
        await this.passwordInput.setValue(password);
        await this.signInButton.click();
        // Wait for redirect away from login
        await browser.waitUntil(
            async () => !(await browser.getUrl()).includes('/login'),
            { timeout: 5000, timeoutMsg: 'Expected redirect from /login after sign in' }
        );
        await browser.pause(300);
    }
}

export default new LoginPage();
