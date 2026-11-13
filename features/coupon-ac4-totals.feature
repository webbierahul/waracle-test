Feature: [WS-101] AC-4: Order Total Calculation Formula
  As a customer
  I want the order total to follow the formula (Total = Subtotal - Discount + Shipping)
  So that my billing is transparent and mathematically correct

  Background:
    Given the customer has added a product to the cart
    And the customer is on the cart page

  Scenario: Total calculation without coupon is Subtotal plus Shipping
    Then the order total should equal subtotal plus shipping

  Scenario: Total calculation with coupon satisfies Subtotal minus Discount plus Shipping
    When the customer applies coupon code "WARACLE25"
    Then the order total should equal subtotal minus discount plus shipping

  Scenario: Total calculation remains consistent with multiple items and quantities
    When the customer adds another product to the cart
    And the customer applies coupon code "WARACLE25"
    Then the order total should equal subtotal minus discount plus shipping
