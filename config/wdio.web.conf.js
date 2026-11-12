import { baseConfig } from './wdio.base.conf.js';

const isHeadless = process.env.HEADLESS !== 'false';

/**
 * Web-specific WebDriverIO configuration.
 */
export const config = {
    ...baseConfig,
    runner: 'local',
    specs: [
        './test/specs/**/*.spec.js',
    ],
    maxInstances: 1,
    capabilities: [{
        browserName: 'chrome',
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
