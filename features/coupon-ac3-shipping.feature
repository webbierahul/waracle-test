Feature: [WS-101] AC-3: Standard Shipping on Basket
  As a customer
  I want standard £5.00 shipping applied to non-empty baskets
  And £0 shipping on an empty basket

  Scenario: Empty cart has no shipping charge
    Given the customer has an empty cart
    Then the empty cart message should be displayed
    And no shipping charge should be applied

  Scenario: Standard shipping of £5.00 applies to a single-item basket
    Given the customer has added a product to the cart
    And the customer is on the cart page
    Then the shipping cost should be "£5.00"

  Scenario: Standard shipping remains £5.00 for multiple items
    Given the customer has added 3 items of a product to the cart
    And the customer is on the cart page
    Then the shipping cost should be "£5.00"

  Scenario: Applying coupon does not alter the £5.00 shipping cost
    Given the customer has added a product to the cart
    And the customer is on the cart page
    When the customer applies coupon code "WARACLE25"
    Then the shipping cost should be "£5.00"
