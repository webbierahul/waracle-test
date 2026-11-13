import fs from 'node:fs';
import { generate } from 'multiple-cucumber-html-reporter';
import cucumberJson from 'wdio-cucumberjs-json-reporter';

/**
 * Base WebDriverIO configuration for Cucumber Web runner.
 */
export const baseConfig = {
    maxInstances: 1,
    logLevel: 'warn',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    framework: 'cucumber',
    cucumberOpts: {
        require: ['./features/step-definitions/**/*.js'],
        backtrace: false,
        requireModule: [],
        dryRun: false,
        failFast: false,
        snippets: true,
        source: true,
        strict: false,
        tagExpression: '',
        timeout: 60000,
        ignoreUndefinedDefinitions: false,
    },
    reporters: [
        'spec',
        ['cucumberjs-json', {
            jsonFolder: './reports/cucumber-json/',
            language: 'en',
        }],
    ],
    onPrepare: function () {
        if (fs.existsSync('./reports/cucumber-json')) {
            fs.rmSync('./reports/cucumber-json', { recursive: true, force: true });
        }
        if (fs.existsSync('./reports/cucumber-html')) {
            fs.rmSync('./reports/cucumber-html', { recursive: true, force: true });
        }
    },
    onComplete: function () {
        try {
            generate({
                jsonDir: './reports/cucumber-json/',
                reportPath: './reports/cucumber-html/',
                reportName: 'Waracle Store — Coupon Codes (WS-101) Cucumber Test Report',
                pageTitle: 'Waracle Store — Cucumber Test Report',
                displayDuration: true,
                metadata: {
                    browser: {
                        name: 'chrome',
                    },
                    device: 'Local Machine',
                    platform: {
                        name: 'macOS',
                    },
                },
                customData: {
                    title: 'Execution Info',
                    data: [
                        { label: 'Project', value: 'Waracle Store' },
                        { label: 'Feature', value: 'WS-101 Coupon Codes at Checkout' },
                        { label: 'Target', value: 'http://127.0.0.1:5173' },
                        { label: 'Framework', value: 'WebDriverIO v8 + Cucumber BDD' },
                    ],
                },
            });
            console.log('\n📊 Cucumber HTML report generated at: ./reports/cucumber-html/index.html\n');
        } catch (err) {
            console.error('Failed to generate Cucumber HTML report:', err);
        }
    },
    afterStep: async function (step, scenario, { error }) {
        if (error) {
            try {
                cucumberJson.attach(await browser.takeScreenshot(), 'image/png');
            } catch (err) {
                // Ignore capture errors
            }
        }
    },
};
