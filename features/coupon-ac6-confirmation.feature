Feature: [WS-101] AC-6: Order Confirmation Reflects Coupon, Discount and Final Total
  As a customer
  I want my order confirmation to show the applied coupon, discount, and final total
  So that I have a receipt of my purchase and discount

  Scenario: Completed checkout reflects applied coupon and discount on confirmation
    Given the customer has added a product to the cart
    And the customer is on the cart page
    When the customer applies coupon code "WARACLE25"
    And the customer proceeds to checkout and signs in as "john.doe@example.com"
    And the customer completes checkout with valid customer and payment details
    Then the order confirmation screen should display a valid order number
    And the order confirmation should display applied coupon "WARACLE25"
    And the order confirmation discount should match the cart discount
    And the order confirmation total should match the checkout total
