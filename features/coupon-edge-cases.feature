Feature: [WS-101] Coupon Codes — Edge Cases & Resilience
  As a customer
  I want flexible coupon input handling and reactive cart updates
  So that coupon application is resilient to case variations and cart changes

  Background:
    Given the customer has added a product to the cart
    And the customer is on the cart page

  Scenario: Coupon code is case-insensitive with lowercase input
    When the customer applies coupon code "waracle25"
    Then a discount deduction should appear in the order summary

  Scenario: Coupon code is case-insensitive with mixed case input
    When the customer applies coupon code "Waracle25"
    Then a discount deduction should appear in the order summary

  Scenario: Coupon code trims leading and trailing whitespace
    When the customer applies coupon code "  WARACLE25  "
    Then a discount deduction should appear in the order summary

  Scenario: Incrementing item quantity reactively updates totals
    When the customer applies coupon code "WARACLE25"
    And the customer increments the item quantity
    Then the subtotal should increase
    And the order total should equal subtotal minus discount plus shipping

  Scenario: Removing the only item from the cart resets order summary
    When the customer applies coupon code "WARACLE25"
    And the customer removes the item from the cart
    Then the empty cart message should be displayed
