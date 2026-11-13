import { ReportAggregator } from 'wdio-html-nice-reporter';

let reportAggregator;

/**
 * Base WebDriverIO configuration for Web runner.
 */
export const baseConfig = {
    maxInstances: 1,
    logLevel: 'warn',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    framework: 'mocha',
    reporters: [
        'spec',
        ['html-nice', {
            outputDir: './reports/html-reports/',
            filename: 'report.html',
            reportTitle: 'Waracle Store — Test Automation Report',
            linkScreenshots: true,
            showInBrowser: false,
            collapseTests: false,
            useOnAfterCommandForScreenshot: false,
        }],
    ],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },
    onPrepare: function () {
        reportAggregator = new ReportAggregator({
            outputDir: './reports/html-reports/',
            filename: 'master-report.html',
            reportTitle: 'Waracle Store — Automated Test Report',
            browserName: 'Chrome',
            collapseTests: false,
        });
        reportAggregator.clean();
    },
    onComplete: async function () {
        if (reportAggregator) {
            await reportAggregator.createReport();
        }
    },
    afterTest: async function (test, context, { error }) {
        if (error) {
            await browser.takeScreenshot();
        }
    },
};
