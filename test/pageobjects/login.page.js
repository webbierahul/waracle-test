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
        await this.emailInput.waitForDisplayed({ timeout: 10000 });

        await browser.execute((em, pw) => {
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
            setField('#email', em);
            setField('#password', pw);
        }, email, password);

        await browser.pause(300);

        await browser.execute(() => {
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
            }
        });

        // Wait for redirect away from login
        await browser.waitUntil(
            async () => !(await browser.getUrl()).includes('/login'),
            { timeout: 10000, timeoutMsg: 'Expected redirect from /login after sign in' }
        );
        await browser.pause(300);
    }
}

export default new LoginPage();
