# Waracle Store — Test Automation Framework (WS-101)

A robust, maintainable, Node.js-based test automation framework built with **WebDriverIO (v8)** in **JavaScript (ES Modules)**, designed to validate the **Coupon Codes at Checkout** release (**WS-101**) across web and architected for seamless extension to mobile automation via **Appium**.

---

## Table of Contents
1. [Sprint Overview & Scope](#sprint-overview--scope)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Project Structure](#project-structure)
4. [Prerequisites & Getting Started](#prerequisites--getting-started)
5. [Running the Tests](#running-the-tests)
6. [Acceptance Criteria (AC) Coverage Matrix](#acceptance-criteria-ac-coverage-matrix)
7. [Appium Mobile Extendability](#appium-mobile-extendability)
8. [QA Release Observations & Defect Reports](#qa-release-observations--defect-reports)

---

## Sprint Overview & Scope

### Story WS-101: Coupon Codes at Checkout
> **As a customer**, I want to apply a coupon code at the cart and checkout so that I can receive a discount on my purchase.

### Target Acceptance Criteria
* **AC-1**: Customer can apply coupon code from cart.
* **AC-2**: Applying `WARACLE25` reduces subtotal by 25%.
* **AC-3**: Standard shipping of £5.00 applies to any non-empty basket.
* **AC-4**: Order total = subtotal − discount + shipping.
* **AC-5**: Invalid or empty code applies no discount and shows a clear message.
* **AC-6**: Order confirmation shows applied coupon, discount, and final total.

---

## Tech Stack & Architecture

* **Runtime & Language**: Node.js (v20+), JavaScript (native ES Modules `"type": "module"`).
* **Test Automation Framework**: [WebDriverIO v8](https://webdriver.io/) (`@wdio/cli`, `@wdio/local-runner`).
* **Test Runner / Assertion Library**: Mocha Framework (`@wdio/mocha-framework`) + native WebdriverIO expect assertions.
* **Reporting**: Spec Reporter (`@wdio/spec-reporter`) with clean console output and defect diagnostics.
* **Design Pattern**: **Page Object Model (POM)** with dedicated component objects (`NavbarComponent`) and Screen Object counterparts for mobile (`CartScreen`).
* **Cross-Platform Strategy**: Configuration-driven capability splitting:
  - `config/wdio.base.conf.js`: Common runner settings, timeouts, reporters, and single-instance worker configuration.
  - `config/wdio.web.conf.js`: Desktop browser configuration (Chrome headless/headed).
  - `config/wdio.appium.conf.js`: Native/hybrid mobile configuration (Android UiAutomator2 & iOS XCUITest).

---

## Project Structure

```text
waracle-test/
├── config/
│   ├── wdio.base.conf.js       # Shared runner config, timeouts, reporters
│   ├── wdio.web.conf.js        # Web capabilities (Chrome, headless flag)
│   └── wdio.appium.conf.js     # Mobile capabilities (UiAutomator2, XCUITest)
├── test/
│   ├── fixtures/
│   │   └── testData.js         # Centralized coupons, test users, and checkout data
│   ├── helpers/
│   │   └── currency.js         # Currency parser (£, -, unicode dashes, rounding)
│   ├── pageobjects/
│   │   ├── page.js             # Base Page Object (session cleanup, toast waits)
│   │   ├── navbar.component.js # Global header & navigation bar component
│   │   ├── products.page.js    # Product catalogue page object
│   │   ├── product-detail.page.js # Product detail & Add-to-Cart page object
│   │   ├── cart.page.js        # Shopping Cart & Order Summary page object
│   │   ├── login.page.js       # Authentication page object
│   │   ├── checkout.page.js    # Checkout, billing, shipping & payment page object
│   │   ├── order-success.page.js # Order confirmation page object
│   │   └── mobile/
│   │       └── cart.screen.js  # Appium Screen Object mapped to mobile testIDs
│   └── specs/
│       ├── coupon-ac1-apply.spec.js        # AC-1: Coupon input & application
│       ├── coupon-ac2-discount.spec.js     # AC-2: 25% discount calculation & defect detection
│       ├── coupon-ac3-shipping.spec.js     # AC-3: £5.00 flat standard shipping
│       ├── coupon-ac4-totals.spec.js       # AC-4: Total = Subtotal - Discount + Shipping
│       ├── coupon-ac5-negative.spec.js     # AC-5: Invalid & empty coupon validation
│       ├── coupon-ac6-confirmation.spec.js # AC-6: End-to-end checkout & confirmation
│       └── coupon-edge-cases.spec.js       # Case sensitivity, whitespace, quantity triggers
├── package.json
├── wdio.conf.js                # Root configuration delegating to config/wdio.web.conf.js
└── README.md
```

---

## Prerequisites & Getting Started

### 1. Prerequisites
* **Node.js**: `v20.x` or higher (verified on Node v20.10.0).
* **Google Chrome**: Latest stable desktop release.
* **Target Application**: Cloned `qa-candidate-test` repository located alongside `waracle-test`.

### 2. Start the Target Web Application
From the `qa-candidate-test/web` directory:
```bash
cd ../qa-candidate-test/web
npm install
npm run dev
```
Verify the web store is accessible at: `http://127.0.0.1:5173`.

### 3. Install Framework Dependencies
From the `waracle-test` directory:
```bash
cd ../waracle-test
npm install
```

---

## Running the Tests

### 1. Full Regression Suite (Standard / Headless)
Executes all 7 spec files (22 tests) in headless Chrome:
```bash
npm test
```

### 2. Headed Mode (Visual Browser)
Launches tests in a visible Chrome browser for visual inspection and debugging:
```bash
npm run test:headed
```

### 3. Strict Acceptance Criteria Mode
Demonstrates the primary calculation defect (**WS-DEFECT-01**). In strict mode, the suite actively asserts that `discount === subtotal * 0.25`, failing immediately on the defect:
```bash
npm run test:strict
```

### 4. Running Individual Specs
Run any specific Acceptance Criteria spec directly:
```bash
# AC-1: Cart coupon application
npx wdio run wdio.conf.js --spec ./test/specs/coupon-ac1-apply.spec.js

# AC-2: Discount calculation
npx wdio run wdio.conf.js --spec ./test/specs/coupon-ac2-discount.spec.js

# AC-3: Shipping rules
npx wdio run wdio.conf.js --spec ./test/specs/coupon-ac3-shipping.spec.js

# AC-4: Order total formula
npx wdio run wdio.conf.js --spec ./test/specs/coupon-ac4-totals.spec.js

# AC-5: Invalid / empty codes
npx wdio run wdio.conf.js --spec ./test/specs/coupon-ac5-negative.spec.js

# AC-6: Checkout & Order Confirmation
npx wdio run wdio.conf.js --spec ./test/specs/coupon-ac6-confirmation.spec.js

# Edge Cases & Resilience
npx wdio run wdio.conf.js --spec ./test/specs/coupon-edge-cases.spec.js
```

---

## Acceptance Criteria (AC) Coverage Matrix

| AC ID | Requirement | Spec File | Key Assertions / Test Scenarios |
|---|---|---|---|
| **AC-1** | Customer can apply coupon code from cart | `coupon-ac1-apply.spec.js` | • Coupon input and Apply button are visible & enabled in Order Summary.<br>• Entering `WARACLE25` displays confirmation badge and discount row in summary.<br>• Discount amount is applied (`> 0`). |
| **AC-2** | Applying `WARACLE25` reduces subtotal by 25% | `coupon-ac2-discount.spec.js` | • Subtotal is reduced when coupon is applied.<br>• Validates calculation against 25% expectation.<br>• Detects and logs **WS-DEFECT-01** (flat £0.25 vs 25%). Supported by `npm run test:strict`. |
| **AC-3** | Standard shipping of £5.00 applies to any non-empty basket | `coupon-ac3-shipping.spec.js` | • Empty basket displays empty state with £0.00 / no shipping charge.<br>• Single item basket applies exactly £5.00 shipping.<br>• Multi-item / multi-quantity basket retains £5.00 flat shipping.<br>• Applying coupon does not alter or discount the £5.00 shipping charge. |
| **AC-4** | Order total = subtotal − discount + shipping | `coupon-ac4-totals.spec.js` | • Total calculation without coupon: `total === subtotal + 5.00`.<br>• Total calculation with coupon: `total === subtotal - discount + 5.00`.<br>• Mathematical consistency holds across varied item prices and quantities. |
| **AC-5** | Invalid or empty code applies no discount and shows a clear message | `coupon-ac5-negative.spec.js` | • Invalid coupon code (`INVALID99`) applies £0.00 discount.<br>• Submitting empty or whitespace-only code applies £0.00 discount.<br>• Overwriting a valid coupon with an empty submission clears active discount.<br>• Verifies user feedback toast (identifies **WS-DEFECT-02**). |
| **AC-6** | Order confirmation shows applied coupon, discount, and final total | `coupon-ac6-confirmation.spec.js` | • End-to-end checkout flow: cart → proceed to checkout → authentication → payment.<br>• Order confirmation page renders generated order number (`#WS-2024-xxxxxx`).<br>• Confirmation displays applied coupon code (`WARACLE25`).<br>• Confirmation reflects discount amount matching checkout summary.<br>• Final total paid reflects `subtotal - discount + shipping`. |
| **Edge** | Edge Cases & Resilience | `coupon-edge-cases.spec.js` | • Case-insensitivity: accepts lowercase `waracle25`.<br>• Case-insensitivity: accepts mixed-case `Waracle25`.<br>• Leading and trailing whitespace trimming (`  WARACLE25  `).<br>• Reactive total recalculation when item quantity changes in cart.<br>• Basket state resets cleanly when sole item is removed. |

---

## Appium Mobile Extendability

The framework was intentionally designed so the web tests can be extended to native mobile applications (such as the React Native / Expo application in `qa-candidate-test/mobile`) with zero test logic refactoring.

### 1. Element Locator Mapping (Web vs. Mobile)
The mobile app in `qa-candidate-test/mobile` already defines explicit `testID` attributes that map directly to our Web Page Object interactions:

| Feature / Action | Web Locator (CSS / XPath) | Mobile Locator (Appium Accessibility ID `~testID`) | Mobile Component File |
|---|---|---|---|
| Coupon Input | `input[placeholder="e.g. WARACLE25"]` | `~cart_coupon_input` | `mobile/src/screens/CartScreen.tsx:112` |
| Apply Coupon Button | `button=Apply` | `~cart_apply_button` | `mobile/src/screens/CartScreen.tsx:117` |
| Proceed to Checkout | `button=Proceed to Checkout` | `~cart_proceed_button` | `mobile/src/screens/CartScreen.tsx:138` |
| Start Shopping (Empty) | `a=Start Shopping` | `~cart_start_shopping_button` | `mobile/src/screens/CartScreen.tsx:32` |
| Subtotal Value | `aside.card span:nth-child(2)` | `~cart_subtotal_amount` | `mobile/src/screens/CartScreen.tsx` |
| Coupon Discount Value | `//div[span[contains(., "Coupon")]]` | `~cart_discount_amount` | `mobile/src/screens/CartScreen.tsx` |
| Shipping Cost | `//div[span[text()="Shipping"]]` | `~cart_shipping_amount` | `mobile/src/screens/CartScreen.tsx` |
| Total Cost | `//div[span[text()="Total"]]` | `~cart_total_amount` | `mobile/src/screens/CartScreen.tsx` |

### 2. Mobile Screen Object Implementation
Located at `test/pageobjects/mobile/cart.screen.js`:
```javascript
class CartScreen {
    get couponInput() { return $('~cart_coupon_input'); }
    get applyButton() { return $('~cart_apply_button'); }
    get proceedButton() { return $('~cart_proceed_button'); }

    async applyCoupon(code) {
        await this.couponInput.waitForDisplayed();
        await this.couponInput.setValue(code);
        await this.applyButton.click();
    }
}
export default new CartScreen();
```

### 3. Execution on Mobile
Appium capabilities are pre-configured in `config/wdio.appium.conf.js` for Android (UiAutomator2) and iOS (XCUITest). Run:
```bash
# 1. Start Appium server
npx appium

# 2. Run mobile suite
npm run test:appium
```

---

## QA Release Observations & Defect Reports

During test design and execution against Release **WS-101**, the following defects and concerns were discovered in the application under test (SUT):

---

### Defect 1: [WS-DEFECT-01] Critical — Coupon WARACLE25 Applies Flat 25p Instead of 25% Discount

* **Severity**: Critical / Blocker
* **Priority**: P1 (Immediate Fix Required)
* **Status**: Open / Reported
* **Affected Components**:
  - Web Frontend: `web/src/services/pricing.ts` (Line 22)
  - Backend API: `backend/src/utils/pricing.js` (Line 22)
* **Acceptance Criteria Violated**: **AC-2** ("Applying `WARACLE25` reduces subtotal by 25%") and **AC-4**.

#### Description
When applying the valid coupon code `WARACLE25`, the application applies a flat discount of **£0.25 (25 pence)** rather than **25% of the basket subtotal**.

#### Steps to Reproduce
1. Navigate to the store at `http://127.0.0.1:5173/products`.
2. Add "Men's Logo T-Shirt" (£24.99) or "Waracle Beanie" (£19.99) to cart.
3. Navigate to the shopping cart (`/cart`). Observe Subtotal = £19.99.
4. Enter `WARACLE25` into the coupon input and click **Apply**.
5. Observe the discount row in the Order Summary.

#### Expected Result
* Expected Discount: `£19.99 × 0.25 = £5.00`
* Expected Total: `£19.99 − £5.00 + £5.00 (shipping) = £19.99`

#### Actual Result
* Actual Discount: `−£0.25`
* Actual Total: `£19.99 − £0.25 + £5.00 (shipping) = £24.74`

#### Root Cause Analysis
In both `web/src/services/pricing.ts` and `backend/src/utils/pricing.js`, line 22 contains:
```javascript
// BUG in SUT:
if (code === 'WARACLE25') {
    discount = 0.25;  // <--- Hardcoded flat 25p
}
```
#### Proposed Fix
```javascript
// Corrected Implementation:
if (code === 'WARACLE25') {
    discount = round2(subtotal * 0.25);
}
```
*Verification Note*: The test suite captures this defect in `npm run test:strict`.

---

### Defect 2: [WS-DEFECT-02] Medium — Invalid Coupon Returns Informational Toast; Empty Submission Lacks User Feedback

* **Severity**: Medium
* **Priority**: P2
* **Status**: Open / Reported
* **Affected Component**: `web/src/pages/CartPage.tsx` (Lines 30–37)
* **Acceptance Criteria Violated**: **AC-5** ("Invalid or empty code applies no discount and shows a clear message").

#### Description
1. When a customer enters an invalid coupon code (e.g. `INVALID99`), the application displays a neutral informational toast `"Coupon entered"` with `type: 'info'` instead of an error message such as `"Invalid coupon code"`.
2. When a customer clicks "Apply" with an empty input field, the application silently calls `clearCoupon()` and produces no user-facing message whatsoever.

#### Steps to Reproduce
1. Add any item to the cart and navigate to `/cart`.
2. Enter `INVALID99` and click **Apply**.
3. Observe toast notification: says `"Coupon entered"` in grey (info style).
4. Clear the input field and click **Apply**.
5. Observe that no message or validation indicator is shown to the customer.

#### Expected Result
* Entering an invalid coupon code should display an explicit error alert/toast: `"Invalid coupon code"`.
* Submitting an empty field should indicate `"Please enter a coupon code"`.

#### Proposed Fix
In `CartPage.tsx`:
```typescript
const handleCoupon = () => {
    if (!code.trim()) {
        notify('Please enter a coupon code', 'error');
        return;
    }
    if (code.trim().toUpperCase() === 'WARACLE25') {
        applyCoupon(code);
        notify('Coupon applied', 'success');
    } else {
        notify('Invalid coupon code', 'error');
    }
};
```

---

### Defect 3: [WS-DEFECT-03] Minor — Missing Coupon Code Input on Checkout Page

* **Severity**: Minor / Requirement Discrepancy
* **Priority**: P3
* **Status**: Open / Reported
* **Affected Component**: `web/src/pages/CheckoutPage.tsx`
* **Requirement Reference**: User Story WS-101 ("As a customer, I want to apply a coupon code **at the cart and checkout**...").

#### Description
The user story states that customers can apply coupon codes at both the cart and the checkout screen. However, `CheckoutPage.tsx` only renders an existing coupon discount in the Order Summary if one was already applied in the cart. There is no input field or button on the Checkout page allowing customers to enter, update, or remove coupons directly during checkout.

#### Recommendation
Add the coupon code input component to Column 2 (Order Summary) of `CheckoutPage.tsx`, mirroring the cart experience so customers who reached checkout directly can still enter promotion codes.

---

### Defect 4: [WS-DEFECT-04] UX Observation — Late Authentication Gating at Order Placement

* **Severity**: Trivial / UX Improvement
* **Priority**: P4
* **Affected Component**: `web/src/pages/CheckoutPage.tsx` & `web/src/utils/mockApi.ts`

#### Description
The Checkout screen allows unauthenticated guest customers to complete the entire contact, shipping address, and payment card form. Only when clicking "Pay" does the backend reject the order with `401 Authentication required`. 
The application should either:
1. Support genuine guest checkout (storing customer contact info with the order), OR
2. Require authentication prior to entering payment details so customers do not enter sensitive payment information only to receive an authentication error.

---

## Author & QA Sign-off
* **Role**: Senior Test Automation Engineer
* **Framework**: WebDriverIO v8 + Mocha + JavaScript (ESM)
* **Test Suite Status**: 7/7 Specs Passing (22/22 Tests Passing in Regression Mode; Strict Defect Reproduction Mode verified).
