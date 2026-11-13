Feature: [WS-101] AC-2: 25% Discount Calculation on Subtotal
  As a customer
  I want WARACLE25 to reduce my subtotal by 25%
  So that I receive the advertised 25% savings

  Background:
    Given the customer has added a product with price "£19.99" to the cart
    And the customer is on the cart page

  Scenario: Applying WARACLE25 reflects a discount deduction in the order summary
    When the customer applies coupon code "WARACLE25"
    Then a discount deduction should appear in the order summary
    And the order total should be reduced by the applied discount

  @defect @WS-DEFECT-01
  Scenario: Applying WARACLE25 strictly calculates a 25% discount on the subtotal
    When the customer applies coupon code "WARACLE25"
    Then the discount amount should be exactly 25% of the subtotal
