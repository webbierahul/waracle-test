import { baseConfig } from './wdio.base.conf.js';

/**
 * Appium Mobile WebDriverIO configuration.
 * Extends the base configuration to automate native/hybrid mobile instances (Expo / React Native).
 *
 * To run:
 *   1. Start Appium server: `npx appium`
 *   2. Run mobile suite: `npm run test:appium`
 */
export const config = {
    ...baseConfig,
    port: 4723,
    services: ['appium'],
    specs: [
        './test/specs/**/*.spec.js',
    ],
    capabilities: [
        // Android Emulator / Real Device preset
        {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
            'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Pixel_6_API_34',
            'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '14.0',
            'appium:app': process.env.ANDROID_APP_PATH || './apps/WaracleStore.apk',
            'appium:appPackage': 'com.waracle.store',
            'appium:appActivity': 'com.waracle.store.MainActivity',
            'appium:autoGrantPermissions': true,
            'appium:newCommandTimeout': 240,
        },
        /*
        // iOS Simulator / Real Device preset
        {
            platformName: 'iOS',
            'appium:automationName': 'XCUITest',
            'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 15 Pro',
            'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '17.0',
            'appium:app': process.env.IOS_APP_PATH || './apps/WaracleStore.app',
            'appium:newCommandTimeout': 240,
        }
        */
    ],
};
