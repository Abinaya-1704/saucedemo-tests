// Central configuration. Every value can be overridden with an environment
// variable, so nothing environment-specific lives inside the tests.

module.exports = {
  BASE_URL: (process.env.BASE_URL || 'https://www.saucedemo.com').replace(/\/+$/, ''),

  // The practice site prints this password on its login page.
  PASSWORD: process.env.SAUCE_PASSWORD || 'secret_sauce',

  USERS: {
    standard: process.env.STANDARD_USER || 'standard_user',
    lockedOut: process.env.LOCKED_OUT_USER || 'locked_out_user',
  },

  // Customer details used on the checkout form.
  CHECKOUT_INFO: {
    firstName: process.env.CHECKOUT_FIRST_NAME || 'Abinaya',
    lastName: process.env.CHECKOUT_LAST_NAME || 'V',
    postalCode: process.env.CHECKOUT_POSTAL_CODE || '641601',
  },

  // Paths relative to BASE_URL
  LOGIN_PATH: '/',
  INVENTORY_PATH: '/inventory.html',
};
