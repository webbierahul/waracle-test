/**
 * Centralized test data for E2E suites.
 */

export const COUPONS = {
    VALID_WARACLE25: 'WARACLE25',
    LOWERCASE_WARACLE25: 'waracle25',
    MIXED_CASE_WARACLE25: 'Waracle25',
    WITH_SPACES_WARACLE25: '  WARACLE25  ',
    INVALID_CODE: 'INVALID99',
    EXPIRED_CODE: 'EXPIRED2023',
    EMPTY_CODE: '',
    WHITESPACE_ONLY: '   ',
};

export const PRICING = {
    STANDARD_SHIPPING: 5.00,
    WARACLE25_DISCOUNT_PERCENT: 0.25,
};

export const USERS = {
    DEMO: {
        email: 'john.doe@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        token: 'mock-token.u-demo',
    },
};

export const CHECKOUT_CUSTOMER = {
    fullName: 'Jane Customer',
    email: 'jane.customer@example.com',
    phone: '07123456789',
    address: '10 High Street',
    city: 'Edinburgh',
    postcode: 'EH1 1YZ',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12 / 28',
    cvc: '123',
};
