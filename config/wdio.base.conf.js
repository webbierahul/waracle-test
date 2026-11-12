/**
 * Base WebDriverIO configuration shared across Web and Mobile (Appium) runners.
 */
export const baseConfig = {
    maxInstances: 1,
    logLevel: 'warn',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },
};
