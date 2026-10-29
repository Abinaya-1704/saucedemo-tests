const base = require('@playwright/test');
const config = require('./config');
const { LoginPage } = require('./pages/LoginPage');
const { InventoryPage } = require('./pages/InventoryPage');
const { CartPage } = require('./pages/CartPage');
const { CheckoutPage } = require('./pages/CheckoutPage');

// Playwright gives every test a fresh browser context, so each test starts logged
// out with an empty cart. That is what lets tests run alone and in any order.
const test = base.test.extend({
  // Login page, already opened.
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  // Logs the standard user in and waits for the products page.
  loggedIn: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.login(config.USERS.standard);
    await base.expect(inventoryPage.title).toHaveText('Products');
    await use();
  },
});

module.exports = { test, expect: base.expect };
