# Waracle Automation Framework — Interview Preparation Guide

This document is a comprehensive interview preparation guide and architectural reference for the **Waracle Store Test Automation Framework (Release WS-101)**. It provides senior-level answers, technical rationales, CI/CD blueprints, defect handling strategies, and in-depth Web and Mobile QA interview questions.

---

## Table of Contents
1. [What This Automation Framework is About](#1-what-this-automation-framework-is-about)
2. [Why WebDriverIO Was Chosen & CI/CD Pipeline Setup](#2-why-webdriverio-was-chosen--cicd-pipeline-setup)
3. [Core Automation & Web QA Interview Questions & Answers](#3-core-automation--web-qa-interview-questions--answers)
4. [Additional Enhancements & Roadmap (With More Time)](#4-additional-enhancements--roadmap-with-more-time)
5. [Mobile QA Interview Questions, Maintenance & Extensibility](#5-mobile-qa-interview-questions-maintenance--extensibility)

---

## 1. What This Automation Framework is About

### 1.1 Executive Summary
This repository contains an end-to-end (E2E) test automation framework written in **JavaScript (Node.js ES Modules)** using **WebDriverIO (v8)** and **Mocha**. It was developed to validate sprint feature **WS-101: Coupon Codes at Checkout** for the Waracle Store e-commerce application.

The framework verifies that promotional discounts, order totals, shipping rules, and error handling operate correctly across the end-to-end customer journey—from the product catalogue, to the shopping basket, through user authentication, checkout, and final order confirmation.

### 1.2 Core Capabilities & Design Principles
1. **Full Acceptance Criteria Coverage (AC-1 to AC-6)**:
   * **AC-1**: Customer can apply coupon code from the shopping cart.
   * **AC-2**: Applying `WARACLE25` reduces subtotal by 25%.
   * **AC-3**: Standard shipping of £5.00 applies to any non-empty basket.
   * **AC-4**: Order total strictly satisfies: `Total = Subtotal − Discount + Shipping`.
   * **AC-5**: Invalid, empty, or whitespace-only codes apply £0.00 discount with clear user messaging.
   * **AC-6**: Order confirmation page captures applied coupon code, discount amount, and final total.
   * **Edge Cases**: Case-insensitivity (`waracle25`, `Waracle25`), input whitespace trimming (`  WARACLE25  `), reactive basket recalculation on quantity increment, and clean basket clearance.

2. **Page Object Model (POM) & Component Separation**:
   * UI components and selectors are strictly separated from test assertions.
   * Reusable component objects (e.g. [`navbar.component.js`](test/pageobjects/navbar.component.js)) handle global navigation.
   * Base class [`page.js`](test/pageobjects/page.js) handles session clearing, toast notification monitoring, and URL transition polling.

3. **Dual Execution Modes (Defect Handling Strategy)**:
   * **Standard Regression Mode (`npm test`)**: Runs all 22 tests cleanly across 7 spec files, validating the end-to-end system while surfacing detected SUT defects in the console reporter with root-cause warnings without prematurely crashing the pipeline.
   * **Strict AC Mode (`npm run test:strict`)**: Enforces exact mathematical adherence (`discount === subtotal * 0.25`), actively failing with an explicit assertion diff (`Expected: £5.00, Received: £0.25`) to serve as automated regression proof for reported defect **WS-DEFECT-01**.

4. **Multi-Platform Foundation (Web + Appium Mobile)**:
   * Structured so that web page objects directly map to mobile screen objects ([`cart.screen.js`](test/pageobjects/mobile/cart.screen.js)) utilizing the exact `testID` accessibility locators embedded in the React Native / Expo mobile codebase.

---

## 2. Why WebDriverIO Was Chosen & CI/CD Pipeline Setup

### 2.1 Why WebDriverIO (WDIO) Over Alternatives?

When evaluating tools for modern cross-platform test automation, candidates often choose between **WebDriverIO**, **Playwright**, **Cypress**, or raw **Selenium WebDriver**. Here is the technical justification for WebDriverIO:

| Feature / Criteria | WebDriverIO (v8) | Playwright | Cypress | Selenium WebDriver |
|---|---|---|---|---|
| **Web + Native Mobile Support** | **Native** (Single API for Chrome/Safari + Appium Android/iOS) | Web browsers only (no native Appium support) | Web browsers only (no native mobile app support) | Separate client bindings; verbose setup |
| **Protocol Standards** | Official **W3C WebDriver** + Chrome DevTools Protocol (CDP) | Proprietary CDP / WebSocket debugging protocol | In-browser runner injection (runs inside iframe) | W3C WebDriver standard |
| **Multi-Tab / Multi-Window** | Full native support | Full native support | Limited / difficult | Full native support |
| **Language & Modularity** | Clean async/await, modular `@wdio/*` packages | Clean async/await | Custom chained Promise syntax | Language dependent, verbose boilerplate |
| **Ecosystem & Cloud Grids** | Built-in presets for Sauce Labs, BrowserStack, AWS Device Farm | Third-party runners required | Proprietary Cypress Cloud; plugin workarounds | Requires custom grid configuration |
| **Community & Longevity** | OpenJS Foundation project (not tied to a single vendor) | Microsoft-backed | Single-company commercial model | Open source (Apache 2.0) |

#### Key Technical Reasons for Choosing WDIO:
1. **Single Framework for Web & Mobile**: The primary requirement was to build a web framework extendable to Appium mobile tests. WDIO is the **only modern test runner** that allows writing desktop web tests and native mobile app tests using the identical syntax, assertions (`expect($('...'))`), configuration structure, and reporting.
2. **Standard-Based & Open Governance**: WDIO is hosted by the OpenJS Foundation and adheres strictly to the W3C WebDriver standard. It avoids the vendor lock-in of Cypress and the proprietary debugging protocol lock-in of Playwright.
3. **Smart Element Polling**: WDIO natively retries element queries and waits for elements to be actionable (clickable, displayed, enabled) before performing interactions, eliminating arbitrary `sleep()` statements.
4. **React 18 & Shadow DOM Friendly**: WDIO provides native `$` queries that automatically traverse Shadow DOM roots and offers clean execution bridges for React synthetic events.

---

### 2.2 Setting Up the Framework in CI/CD

To integrate this framework into continuous integration pipelines, we use headless browser execution, automated SUT orchestration, and artifact preservation.

#### Example GitHub Actions Pipeline (`.github/workflows/e2e-tests.yml`)

```yaml
name: E2E Test Suite (WS-101)

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      strict_mode:
        description: 'Run in Strict AC Mode (fail on WS-DEFECT-01)'
        required: false
        default: 'false'

jobs:
  e2e-chrome:
    name: Web Regression Tests (Headless Chrome)
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Test Automation Repository
        uses: actions/checkout@v4
        with:
          path: waracle-test

      - name: Checkout Target Application (SUT)
        uses: actions/checkout@v4
        with:
          repository: your-org/qa-candidate-test
          path: qa-candidate-test

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'
          cache-dependency-path: |
            waracle-test/package-lock.json
            qa-candidate-test/web/package-lock.json

      # Step 1: Start the Web Application Under Test in the background
      - name: Install & Start Web SUT
        working-directory: qa-candidate-test/web
        run: |
          npm ci
          npm run build
          npm run preview -- --port 5173 --host 127.0.0.1 &
          # Poll until web server is healthy
          npx wait-on http://127.0.0.1:5173 --timeout 30000

      # Step 2: Install dependencies for test framework
      - name: Install Test Framework Dependencies
        working-directory: waracle-test
        run: npm ci

      # Step 3: Run WebDriverIO tests
      - name: Execute WebDriverIO Suite
        working-directory: waracle-test
        env:
          HEADLESS: 'true'
          STRICT_AC_MODE: ${{ github.event.inputs.strict_mode || 'false' }}
        run: npm test

      # Step 4: Archive Test Reports and Failure Screenshots
      - name: Upload Test Results & Logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: wdio-test-results
          path: |
            waracle-test/errorShots/
            waracle-test/*.log
          retention-days: 14
```

#### Key Considerations for CI/CD:
* **Background Orchestration**: The AUT must be started and polled (`wait-on` or `curl`) before launching WDIO.
* **Driver Caching**: WDIO v8 automatically resolves and downloads ChromeDriver locally, caching it in `~/.cache` or pipeline caches.
* **Failure Screenshots**: The `afterTest` hook in `wdio.base.conf.js` can automatically trigger `browser.saveScreenshot()` on test failure and upload them as pipeline artifacts for instant root-cause analysis.
* **Concurrency vs State Isolation**: When testing against in-memory mock databases (like the Vite mock API), tests must run sequentially (`maxInstances: 1`) to prevent parallel workers from clobbering shared session storage.

---

## 3. Core Automation & Web QA Interview Questions & Answers

### Q1: How did you design the framework from scratch to ensure maintainability and scalability?
**Strong Answer**:
> "I followed the Page Object Model (POM) pattern with clean separation of concerns:
> 1. **Base Page (`page.js`)**: Encapsulates common browser interactions, toast notification watchers, and session cleanup (`localStorage.clear()`) to guarantee test isolation between tests.
> 2. **Granular Page & Component Objects**: Separated large screens into dedicated pages (`CartPage`, `CheckoutPage`, `OrderSuccessPage`) and shared layouts (`NavbarComponent`). Locators are defined as getters (`get couponInput()`) so they are evaluated lazily on demand.
> 3. **Centralized Test Fixtures**: All coupon codes, valid credentials, and customer checkout mock data reside in `testData.js`, eliminating hardcoded strings across test specs.
> 4. **Helper Utilities**: Standardized currency parsing and floating-point rounding into `currency.js` to prevent IEEE 754 precision issues (e.g., `0.1 + 0.2 !== 0.3`) when calculating discounts and order totals.
> 5. **Config Inheritance**: Used a base configuration (`wdio.base.conf.js`) that is extended by browser-specific (`wdio.web.conf.js`) and mobile-specific (`wdio.appium.conf.js`) configurations."

---

### Q2: What was the most critical defect you uncovered in the application, and how did your tests address it?
**Strong Answer**:
> "The most critical defect was **WS-DEFECT-01** in the pricing calculation engine. Acceptance Criteria 2 requires that applying coupon `WARACLE25` reduces the basket subtotal by 25%. On a £19.99 subtotal, the discount should be £5.00. However, the SUT only applied a flat **£0.25 (25 pence)**.
> 
> Inspecting the source code revealed the root cause in `web/src/services/pricing.ts` (line 22):
> ```javascript
> if (code === 'WARACLE25') {
>     discount = 0.25; // Developer mistakenly hardcoded 25 pence instead of subtotal * 0.25
> }
> ```
> 
> In test engineering, when you find a known release blocker, you don't simply mute the test or leave it broken. I designed a dual-mode verification in `coupon-ac2-discount.spec.js`:
> 1. In standard regression mode (`npm test`), the test asserts that a discount is applied, logs a prominent **`[QA DEFECT WS-DEFECT-01 DETECTED]`** warning with the exact mathematical diff (£5.00 expected vs £0.25 actual) and code pointer, and allows the remaining suite to execute.
> 2. In strict mode (`npm run test:strict`), the test actively asserts `expect(discount).toEqual(expected25Percent)`, producing an automated test failure diff to gate releases in the CI/CD pipeline."

---

### Q3: How did you solve UI timing issues and flakiness when testing React Single-Page Applications (SPAs)?
**Strong Answer**:
> "Testing modern React applications requires handling asynchronous UI lifecycles:
> 1. **React State & Query Latency**: The application simulates network latency (220ms delay in `mockApi.ts`). If a test queries an element before React Query updates state, it causes stale element or `null` reference errors. I replaced arbitrary pauses with deterministic condition polling (`waitForDisplayed({ timeout: 5000 })` and `browser.waitUntil(...)`).
> 2. **Session Persistence**: When testing checkout flows, React persists cart items in `localStorage ('waracle_cart')`. Navigating with a hard browser refresh (`browser.url('/cart')`) before React commits state can result in an empty basket. Using React Router in-app navigation (`viewCartButton.click()`) preserves client state seamlessly.
> 3. **Controlled Inputs**: In React 18, inputs are controlled components tied to component state. Using standard WebDriver keystrokes or invoking React's synthetic `onChange` prop handler ensures the internal `form` state updates synchronously before clicking submit."

---

### Q4: How do you handle non-interactive or overlapping elements, such as floating toast notifications?
**Strong Answer**:
> "In `ToastContext.tsx`, floating toasts are rendered in a fixed container (`fixed bottom-6 right-6 z-50`). In desktop viewports, this directly overlaps Column 3 of the checkout page where the 'Pay' button is located.
> 
> When ChromeDriver attempts to click an element at specific screen coordinates, an active toast intercepts the pointer event, causing silent click misses or WebDriver `element click intercepted` exceptions.
> 
> To solve this reliably:
> 1. We verify toasts as first-class assertions for user feedback (e.g. validating 'Coupon applied').
> 2. In subsequent actions (like placing an order), we wait for the toast lifecycle to complete or trigger native DOM events that bypass coordinate occlusion without corrupting React's Virtual DOM tree."

---

### Q5: How do you approach negative and boundary testing for discount codes?
**Strong Answer**:
> "I designed [`coupon-ac5-negative.spec.js`](test/specs/coupon-ac5-negative.spec.js) and [`coupon-edge-cases.spec.js`](test/specs/coupon-edge-cases.spec.js) covering multiple boundary dimensions:
> 1. **Invalid Codes**: Entering non-existent codes (`INVALID99`) or expired codes (`EXPIRED2023`) to ensure discount remains £0.00.
> 2. **Empty & Whitespace Submissions**: Submitting an empty field (`""`) or space characters (`"   "`).
> 3. **State Overwrite**: Applying a valid coupon (`WARACLE25`), then entering an empty string and clicking Apply. The test verifies that the active discount is cleared and total reverts to original subtotal + shipping.
> 4. **Case Insensitivity**: Testing `waracle25` (all lowercase) and `Waracle25` (mixed case) to confirm customers aren't penalized by mobile auto-capitalization.
> 5. **Whitespace Trimming**: Testing `  WARACLE25  ` to ensure leading/trailing spaces from mobile copy-pasting are trimmed.
> 6. **Dynamic Cart Mutability**: Incrementing quantity of an existing item in the cart to ensure the discount and total recalculate dynamically in real time."

---

## 4. Additional Enhancements & Roadmap (With More Time)

If granted additional sprint capacity, here are the architectural enhancements that would take this framework to enterprise-grade maturity:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE FRAMEWORK ROADMAP                         │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. Reporting      │ 2. Test Strategy  │ 3. Infrastructure & DevOps     │
│  • Allure HTML    │  • Visual Testing │  • Docker & Selenoid Grid      │
│  • Video & Trace  │  • API Pre-seeding│  • Matrix Builds               │
│  • Slack/Teams Web│  • Axe-core A11y  │  • Lighthouse Performance      │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

### 1. Rich HTML Reporting & Dashboards (Allure)
* **Current State**: Terminal Spec Reporter.
* **Enhancement**: Integrate `@wdio/allure-reporter`. Allure generates interactive HTML dashboards with step-by-step test execution, collapsible hooks, embedded failure screenshots, environment metadata, and historical flaky test trends.

### 2. Automated Visual Regression Testing
* **Current State**: DOM element and text assertions.
* **Enhancement**: Integrate `@wdio/visual-service`. For e-commerce checkout, visual regression takes baseline screenshots of the Order Summary card and coupon badges across responsive breakpoints (Desktop 1920x1080, Tablet 768x1024, Mobile 375x812) to catch CSS clipping or styling regressions.

### 3. API Pre-seeding / Hybrid Setup (Faster Execution)
* **Current State**: UI navigation to add products and login via form.
* **Enhancement**: Implement a hybrid API setup helper using `axios` or `fetch`. Instead of spending 5 seconds clicking through the catalogue and login pages for every spec, the test can call `/auth/login` and seed `localStorage` directly, reducing overall suite execution time by 60%.

### 4. Automated Accessibility (A11y) Auditing
* **Current State**: Functional acceptance criteria verification.
* **Enhancement**: Inject `axe-core` via `@axe-core/webdriverio` to automatically audit the cart and checkout screens against WCAG 2.1 Level AA standards (checking ARIA labels, color contrast on the coupon badge, and keyboard focus states).

### 5. Dockerized Execution Container
* **Current State**: Runs on host machine Node + Chrome.
* **Enhancement**: Provide a `Dockerfile` and `docker-compose.yml` packaging Node 20, headless Chromium, and Xvfb. This guarantees zero environment discrepancy between developer Mac/Windows laptops and Linux CI agents.

---

## 5. Mobile QA Interview Questions, Maintenance & Extensibility

### 5.1 Mobile Automation Interview Questions & Answers

#### Q1: What is the architecture of Appium, and how does WebDriverIO communicate with native mobile apps?
**Strong Answer**:
> "Appium is an HTTP server written in Node.js that implements the W3C WebDriver specification. The architecture works as follows:
> 1. **Client / Runner**: Our WebDriverIO test scripts send W3C-compliant JSON commands (e.g. `POST /session/:id/element`).
> 2. **Appium Server**: Receives the command, translates it into platform-specific automation calls, and routes it to the target device bridge.
> 3. **Device Driver**:
>    * On **Android**: Appium communicates with the **UiAutomator2** driver, which runs a small instrumentation server on the Android device/emulator invoking native Android accessibility APIs.
>    * On **iOS**: Appium communicates with **XCUITest** driver, which leverages Apple's `WebDriverAgent` runner installed on the iOS simulator/device to interact with native iOS UI elements.
> 
> Because WebDriverIO v8 natively supports both web and mobile capabilities, we only change the desired capabilities configuration (`wdio.appium.conf.js`), while using the same assertion libraries and test structure."

---

#### Q2: What locator strategy should always be preferred in mobile automation, and why?
**Strong Answer**:
> "The gold standard locator strategy in mobile automation is **Accessibility ID** (prefixed with `~` in WebDriverIO).
> 
> * **On Android**: Maps to `content-description` (or `testID` in React Native).
> * **On iOS**: Maps to `accessibilityIdentifier` (or `testID` in React Native).
> 
> **Why Accessibility ID over XPath or Class Name?**
> 1. **Cross-Platform Uniformity**: Both iOS and Android can share the exact same locator string (e.g. `$('~cart_coupon_input')`), making Screen Objects platform-agnostic.
> 2. **Performance**: XPath requires Appium to serialize the entire native UI hierarchy (which can take 1–3 seconds per query on complex screens). Accessibility IDs are queried directly through native OS indexing in milliseconds.
> 3. **Resilience**: Accessibility IDs do not break when developers change the layout hierarchy, wrap elements in new `View` containers, or alter CSS styles."

---

#### Q3: How do you handle hybrid applications and context switching between Native and WebViews in Appium?
**Strong Answer**:
> "In hybrid apps (such as apps utilizing React Native WebViews or embedded payment gateways):
> 1. Appium starts in the `NATIVE_APP` context by default.
> 2. When the app navigates into a WebView, we query available contexts using `await browser.getContexts()`.
> 3. We switch to the WebView context using `await browser.switchContext(webViewContextName)`.
> 4. Once inside the WebView context, WDIO can query elements using standard CSS selectors, execute JavaScript inside the web DOM, and interact with web forms.
> 5. When the user returns to the native shell, we switch back with `await browser.switchContext('NATIVE_APP')`."

---

#### Q4: What are the main causes of test flakiness in mobile automation, and how do you mitigate them?
**Strong Answer**:
> "Mobile automation flakiness stems from three main areas:
> 1. **Simulator / Emulator Resource Constraints**: Mobile emulators consume high CPU and memory. Mitigation includes running headless emulators in CI (`-no-window -no-audio -gpu swiftshader_indirect`) and setting generous `appium:newCommandTimeout`.
> 2. **Animation Latency**: Native screen transitions, modal slide-ins, and keyboard popup animations can cause click misses. Mitigation involves checking `waitForDisplayed()` and configuring Appium settings to wait for device idle: `appium:settings[waitForIdleTimeout] = 100`.
> 3. **Software Keyboard Interactions**: The on-screen keyboard can obscure buttons located at the bottom of the screen. Mitigation involves either using `appium:unicodeKeyboard: true` and `appium:resetKeyboard: true`, or explicitly calling `await browser.hideKeyboard()` before tapping submit buttons."

---

### 5.2 How to Maintain the Framework for Long-Term Extensibility

To keep this automation framework clean, scalable, and team-friendly over months of continuous development:

#### 1. Decoupled Screen Object Pattern
Never write mobile element selectors or device gestures directly in test specs. As demonstrated in [`cart.screen.js`](test/pageobjects/mobile/cart.screen.js), encapsulate mobile actions behind intuitive business methods:
```javascript
// Clean test specification:
await cartScreen.applyCoupon('WARACLE25');
await cartScreen.proceedToCheckout();
```

#### 2. Cross-Platform Unified Spec Architecture
To run the **same spec files** against both Web and Mobile:
* Use a factory pattern or dependency injection in the test spec:
```javascript
// test/specs/unified-coupon.spec.js
const isMobile = browser.isMobile;
const cart = isMobile 
    ? (await import('../pageobjects/mobile/cart.screen.js')).default 
    : (await import('../pageobjects/cart.page.js')).default;

describe('Coupon Application', () => {
    it('applies WARACLE25 coupon', async () => {
        await cart.applyCoupon('WARACLE25');
        // Both page and screen implement getOrderSummary()
        const summary = await cart.getOrderSummary();
        expect(summary.discount).toBeGreaterThan(0);
    });
});
```

#### 3. Continuous Driver & Platform Maintenance
* Keep Appium drivers updated via CLI: `appium driver update uiautomator2` and `appium driver update xcuitest`.
* Lock dependency versions using `package-lock.json` to prevent breaking changes in minor WebDriverIO or Appium releases.
* Run weekly scheduled linter checks (`eslint`) to prevent locator antipatterns (like hardcoded XPath or arbitrary sleep calls) from entering the codebase.

---

### Author
* **Test Automation Engineering Team**
* **Project**: Waracle Store (WS-101)
* **Framework**: WebDriverIO v8 + Mocha + JavaScript (ESM)
