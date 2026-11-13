# Waracle Store — Web Test Automation Framework (WS-101)

Automated test suite built with **WebDriverIO (v8)** and **JavaScript** for the Waracle Store web application, focusing on the **Coupon Codes at Checkout** feature (**WS-101**).

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
# Run all tests in headless Chrome (default regression mode)
npm test

# Run tests in headed (visible) Chrome browser
npm run test:headed

# Run in strict mode (fails on defect WS-DEFECT-01)
npm run test:strict

# Run a single spec file
npx wdio run wdio.conf.js --spec ./test/specs/coupon-ac1-apply.spec.js

# Open the HTML test report in browser
npm run report:open
```

---

## Test Reports & Configuration

After every test run, a self-contained HTML test report is automatically generated at:
```text
reports/html-reports/master-report.html
```

To view the report in your browser:
```bash
npm run report:open
```

### Configurable via `config/wdio.base.conf.js`:
* **Reporters**: Configured in `reporters` array (`spec` for terminal output + `html-nice` for HTML output).
* **Output Path**: Stored in `./reports/html-reports/`.
* **Master Aggregation**: Uses WDIO `onPrepare` and `onComplete` lifecycle hooks to combine all 7 spec files into a single unified report.
* **Failure Screenshots**: The `afterTest` hook automatically captures a screenshot on test failure and embeds it in the report.

---

## Test Specs & Coverage

| Spec File | Acceptance Criteria | What It Tests |
|---|---|---|
| `test/specs/coupon-ac1-apply.spec.js` | AC-1 | Coupon input visibility, applying `WARACLE25`, summary line item |
| `test/specs/coupon-ac2-discount.spec.js` | AC-2 | Subtotal discount calculation, defect check |
| `test/specs/coupon-ac3-shipping.spec.js` | AC-3 | £0 shipping on empty cart, flat £5 on single/multi-item carts |
| `test/specs/coupon-ac4-totals.spec.js` | AC-4 | Math verification: `Total = Subtotal - Discount + Shipping` |
| `test/specs/coupon-ac5-negative.spec.js` | AC-5 | Invalid codes, empty strings, whitespace, clearing active coupon |
| `test/specs/coupon-ac6-confirmation.spec.js` | AC-6 | Full flow: cart -> login -> checkout -> confirmation page totals |
| `test/specs/coupon-edge-cases.spec.js` | Edge Cases | Case insensitivity (`waracle25`, `Waracle25`), trimmed spaces, quantity updates |

---

## Project Structure

```text
waracle-test/
├── config/
│   ├── wdio.base.conf.js       # Base runner, timeouts, single-worker setting
│   └── wdio.web.conf.js        # Chrome browser configuration
├── test/
│   ├── fixtures/
│   │   └── testData.js         # Coupons, demo user credentials, customer data
│   ├── helpers/
│   │   └── currency.js         # Currency parsing and rounding utility
│   ├── pageobjects/            # Page Object Model classes
│   │   ├── page.js             # Base page (session reset, toasts, waits)
│   │   ├── navbar.component.js # Header navigation
│   │   ├── products.page.js    # Product list page
│   │   ├── product-detail.page.js # Product details & Add-to-Cart
│   │   ├── cart.page.js        # Cart & order summary
│   │   ├── login.page.js       # User sign in
│   │   ├── checkout.page.js    # Shipping & payment details
│   │   └── order-success.page.js # Order confirmation details
│   └── specs/                  # Test spec files
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
* **Test Note**: Run `npm run test:strict` to see this fail automated verification.

### 2. [WS-DEFECT-02] Medium — Invalid coupon shows info toast; empty code gives no message
* **File**: `web/src/pages/CartPage.tsx` (lines 30-37)
* **Steps to Reproduce**:
  1. Enter `INVALID99` and click Apply. Shows neutral "Coupon entered" toast instead of an error.
  2. Submit an empty coupon field. It silently clears without any user feedback.
* **Expected**: Clear error message per AC-5 (e.g. "Invalid coupon code").

### 3. [WS-DEFECT-03] Minor — No coupon input on Checkout page
* **File**: `web/src/pages/CheckoutPage.tsx`
* **Observation**: User story WS-101 mentions applying coupon "at the cart and checkout". However, the Checkout page only displays a coupon if one was already applied in the cart. There is no input to add or change coupons during checkout.

### 4. [WS-DEFECT-04] UX Observation — Unauthenticated checkout fails late at payment
* **File**: `web/src/pages/CheckoutPage.tsx`
* **Observation**: Guest users can fill in the entire shipping and payment card form before being blocked with a 401 error on clicking "Pay". The app should either prompt for sign-in upfront or support guest checkout.
