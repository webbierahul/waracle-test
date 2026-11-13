import { baseConfig } from './wdio.base.conf.js';

const isHeadless = process.env.HEADLESS !== 'false';

/**
 * Web-specific WebDriverIO configuration for Cucumber.
 */
export const config = {
    ...baseConfig,
    runner: 'local',
    specs: [
        './features/**/*.feature',
    ],
    maxInstances: 1,
    capabilities: [{
        browserName: 'chrome',
        'cjson:metadata': {
            browser: {
                name: 'chrome',
                version: 'latest',
            },
            device: 'MacBook',
            platform: {
                name: 'macOS',
            },
        },
        'goog:chromeOptions': {
            args: [
                ...(isHeadless ? ['--headless=new'] : []),
                '--disable-gpu',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--window-size=1440,900',
            ],
        },
    }],
    baseUrl: process.env.BASE_URL || 'http://127.0.0.1:5173',
};
