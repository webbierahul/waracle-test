Feature: [WS-101] AC-1: Apply Coupon Code from Cart
  As a customer
  I want to apply a coupon code from the cart page
  So that I can receive a promotional discount before checkout

  Background:
    Given the customer has added a product to the cart
    And the customer is on the cart page

  Scenario: Coupon input field and apply button are displayed in the cart
    Then the coupon input field should be displayed
    And the apply coupon button should be visible and clickable

  Scenario: Customer successfully applies valid coupon WARACLE25
    When the customer applies coupon code "WARACLE25"
    Then the applied coupon notice should show "WARACLE25"
    And the order summary should display a coupon discount row for "WARACLE25"
    And the discount amount should be greater than £0.00
