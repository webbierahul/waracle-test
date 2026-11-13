Feature: [WS-101] AC-5: Invalid and Empty Coupon Codes
  As a store owner
  I want invalid or empty coupon codes to apply no discount and show a clear message
  So that invalid codes are rejected and users are properly guided

  Background:
    Given the customer has added a product to the cart
    And the customer is on the cart page

  Scenario: Entering an invalid coupon applies no discount
    When the customer applies coupon code "INVALID99"
    Then no discount should be applied
    And the coupon discount row should not be visible

  @defect @WS-DEFECT-02
  Scenario: Entering an invalid coupon code shows an invalid error message
    When the customer applies coupon code "INVALID99"
    Then a clear error message indicating an invalid coupon should be displayed

  Scenario: Submitting an empty coupon code applies no discount
    When the customer applies an empty coupon code
    Then no discount should be applied
    And the coupon discount row should not be visible

  @defect @WS-DEFECT-02
  Scenario: Submitting an empty coupon code shows a validation message
    When the customer applies an empty coupon code
    Then a validation message should be displayed

  Scenario: Submitting an empty coupon code clears an existing active discount
    Given the customer applies coupon code "WARACLE25"
    And a discount deduction should appear in the order summary
    When the customer applies an empty coupon code
    Then no discount should be applied
    And the coupon discount row should not be visible
