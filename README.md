# Waracle Store — Web Test Automation Framework (WS-101)

Automated BDD test suite built with **WebDriverIO (v8)**, **Cucumber**, and **JavaScript** for the Waracle Store web application, focusing on the **Coupon Codes at Checkout** feature (**WS-101**).

---

## Requirements Covered (Acceptance Criteria)

* **AC-1**: Customer can apply coupon code from cart.
* **AC-2**: Applying `WARACLE25` reduces subtotal by 25%.
* **AC-3**: Standard shipping of £5.00 applies to any non-empty basket.
* **AC-4**: Order total = subtotal − discount + shipping.
* **AC-5**: Invalid or empty code applies no discount and shows a clear message.
* **AC-6**: Order confirmation shows applied coupon, discount, and final total.

---

## Setup & Running Tests

### 1. Start the Web App
From `qa-candidate-test/web`:
```bash
npm install
npm run dev
```
The app runs at `http://127.0.0.1:5173`.

### 2. Install Test Dependencies
From `waracle-test`:
```bash
npm install
```

### 3. Run the Tests
```bash
# Run all Cucumber features in headless Chrome
npm test

# Run tests in headed (visible) Chrome browser
npm run test:headed

# Run a specific feature file
npx wdio run wdio.conf.js --spec ./features/coupon-ac1-apply.feature

# Open the Cucumber HTML test report in browser
npm run report:open
```

---

## Cucumber HTML Test Reports

After every test execution, an interactive, rich **Cucumber HTML Report** is automatically generated at:
```text
reports/cucumber-html/index.html
```

To open the report in your default browser:
```bash
npm run report:open
```

### Report Features & Configuration (`config/wdio.base.conf.js`):
* **Cucumber JSON + HTML**: Generates test metrics via `wdio-cucumberjs-json-reporter` and renders interactive dashboards via `multiple-cucumber-html-reporter`.
* **Failure Screenshots**: When any step fails, an automatic screenshot is taken via the `afterStep` hook and embedded directly into the report.
* **Defect Visibility**: Scenarios asserting Acceptance Criteria that fail due to application bugs are displayed in **red** with full assertion error stack traces and attached UI screenshots.

---

## Features & Coverage Matrix

| Feature File | Acceptance Criteria | What It Tests | Status |
|---|---|---|---|
| `features/coupon-ac1-apply.feature` | AC-1 | Coupon input visibility, applying `WARACLE25`, summary line item | Passed |
| `features/coupon-ac2-discount.feature` | AC-2 | 25% discount formula validation | Failed (Flags WS-DEFECT-01) |
| `features/coupon-ac3-shipping.feature` | AC-3 | £0 shipping on empty cart, flat £5 on single/multi-item carts | Passed |
| `features/coupon-ac4-totals.feature` | AC-4 | Math verification: `Total = Subtotal - Discount + Shipping` | Passed |
| `features/coupon-ac5-negative.feature` | AC-5 | Invalid codes, empty strings, whitespace, clearing active coupon | Failed (Flags WS-DEFECT-02) |
| `features/coupon-ac6-confirmation.feature` | AC-6 | Full flow: cart -> login -> checkout -> confirmation page totals | Passed |
| `features/coupon-edge-cases.feature` | Edge Cases | Case insensitivity (`waracle25`, `Waracle25`), trimmed spaces, quantity updates | Passed |

---

## Project Structure

```text
waracle-test/
├── config/
│   ├── wdio.base.conf.js       # Base runner, cucumberOpts, reporter config, lifecycle hooks
│   └── wdio.web.conf.js        # Chrome browser configuration, specs targeting features
├── features/
│   ├── coupon-ac1-apply.feature
│   ├── coupon-ac2-discount.feature
│   ├── coupon-ac3-shipping.feature
│   ├── coupon-ac4-totals.feature
│   ├── coupon-ac5-negative.feature
│   ├── coupon-ac6-confirmation.feature
│   ├── coupon-edge-cases.feature
│   └── step-definitions/
│       └── steps.js            # Cucumber step definitions with screenshot capture
├── test/
│   ├── fixtures/
│   │   └── testData.js         # Coupons, demo user credentials, customer data
│   ├── helpers/
│   │   └── currency.js         # Currency parsing and rounding utility
│   └── pageobjects/            # Page Object Model classes
│       ├── page.js             # Base page (session reset, toasts, waits)
│       ├── navbar.component.js # Header navigation
│       ├── products.page.js    # Product list page
│       ├── product-detail.page.js # Product details & Add-to-Cart
│       ├── cart.page.js        # Cart & order summary
│       ├── login.page.js       # User sign in
│       ├── checkout.page.js    # Shipping & payment details
│       └── order-success.page.js # Order confirmation details
├── package.json
└── wdio.conf.js
```

---

## Bugs & Observations Found (Release WS-101)

### 1. [WS-DEFECT-01] Critical — Coupon applies 25p flat discount instead of 25%
* **File**: `web/src/services/pricing.ts` (line 22) and `backend/src/utils/pricing.js` (line 22)
* **Steps to Reproduce**:
  1. Add an item (£19.99) to cart.
  2. Apply `WARACLE25`.
* **Expected**: 25% of £19.99 = £5.00 discount. Total = £19.99.
* **Actual**: Discount applied is £0.25 (flat 25 pence). Total = £24.74.
* **Root Cause**: Code has `discount = 0.25;` instead of `discount = round2(subtotal * 0.25);`.
* **Report Status**: Marked as **FAILED** in Cucumber HTML Report under `features/coupon-ac2-discount.feature` (`Expected: 5, Received: 0.25`).

### 2. [WS-DEFECT-02] Medium — Invalid coupon shows info toast; empty code gives no message
* **File**: `web/src/pages/CartPage.tsx` (lines 30-37)
* **Steps to Reproduce**:
  1. Enter `INVALID99` and click Apply. Shows neutral "Coupon entered" toast instead of an error.
  2. Submit an empty coupon field. It silently clears without any user feedback.
* **Expected**: Clear error message per AC-5 (e.g. "Invalid coupon code").
* **Report Status**: Marked as **FAILED** in Cucumber HTML Report under `features/coupon-ac5-negative.feature`.

### 3. [WS-DEFECT-03] Minor — No coupon input on Checkout page
* **File**: `web/src/pages/CheckoutPage.tsx`
* **Observation**: User story WS-101 mentions applying coupon "at the cart and checkout". However, the Checkout page only displays a coupon if one was already applied in the cart. There is no input to add or change coupons during checkout.

### 4. [WS-DEFECT-04] UX Observation — Unauthenticated checkout fails late at payment
* **File**: `web/src/pages/CheckoutPage.tsx`
* **Observation**: Guest users can fill in the entire shipping and payment card form before being blocked with a 401 error on clicking "Pay". The app should either prompt for sign-in upfront or support guest checkout.
