// Every test name starts with its manual case ID from TEST_CASES.md.
const { test, expect } = require('../fixtures');
const config = require('../config');
const { SORT } = require('../pages/InventoryPage');

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.describe('Login', () => {
  test('TC01 standard user logs in', { tag: '@smoke' }, async ({ loginPage, inventoryPage }) => {
    await loginPage.login(config.USERS.standard);

    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('TC02 locked-out user sees an error', { tag: '@smoke' }, async ({ loginPage, inventoryPage }) => {
    await loginPage.login(config.USERS.lockedOut);

    await expect(loginPage.error).toContainText('locked out');
    await expect(loginPage.loginButton).toBeVisible(); // still on the login page
    await expect(inventoryPage.title).toHaveCount(0);
  });

  test('TC03 wrong password is rejected', async ({ loginPage, inventoryPage }) => {
    await loginPage.login(config.USERS.standard, 'wrong_password');

    await expect(loginPage.error).toContainText('do not match');
    await expect(inventoryPage.title).toHaveCount(0);
  });
});

test.describe('Sorting', () => {
  const sortCases = [
    {
      id: 'TC08',
      label: 'low to high',
      option: SORT.PRICE_LOW_HIGH,
      order: (prices) => [...prices].sort((a, b) => a - b),
    },
    {
      id: 'TC09',
      label: 'high to low',
      option: SORT.PRICE_HIGH_LOW,
      order: (prices) => [...prices].sort((a, b) => b - a),
    },
  ];

  for (const c of sortCases) {
    test(`${c.id} sorts by price ${c.label} (whole list checked)`, async ({ loggedIn, inventoryPage }) => {
      const before = await inventoryPage.prices();
      expect(before).toHaveLength(6);

      await inventoryPage.sortBy(c.option);

      // Compare every price in the list, not only the first one. The assertion retries until it matches.
      const expected = c.order(before).map((p) => `$${p.toFixed(2)}`);
      await expect(inventoryPage.itemPrices).toHaveText(expected);
    });
  }
});

test.describe('Cart', () => {
  test('TC11 add two items and remove one: badge and cart contents', async ({
    loggedIn,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(BACKPACK);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.addToCart(BIKE_LIGHT);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart(BACKPACK);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.openCart();
    await expect(cartPage.itemNames).toHaveText([BIKE_LIGHT]);
  });
});

test.describe('Checkout', () => {
  test('TC14 full checkout: total equals item total plus tax, cart empty afterwards', async ({
    loggedIn,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    const chosen = [BACKPACK, BIKE_LIGHT];
    let expectedItemTotal = 0;
    for (const name of chosen) {
      expectedItemTotal += await inventoryPage.priceOf(name);
      await inventoryPage.addToCart(name);
    }
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillDetails(config.CHECKOUT_INFO);
    await checkoutPage.continueToOverview();

    const itemTotal = await checkoutPage.itemTotal();
    const tax = await checkoutPage.tax();
    const total = await checkoutPage.total();
    const toCents = (amount) => Math.round(amount * 100);
    expect(toCents(itemTotal)).toBe(toCents(expectedItemTotal));
    expect(toCents(total)).toBe(toCents(itemTotal) + toCents(tax));

    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toContainText('Thank you');

    // The cart must be empty after the order is placed.
    await expect(inventoryPage.cartBadge).toHaveCount(0);
    await inventoryPage.openCart();
    await expect(cartPage.items).toHaveCount(0);
  });

  const requiredFieldCases = [
    {
      id: 'TC15',
      missing: 'first name',
      details: { ...config.CHECKOUT_INFO, firstName: '' },
      error: 'First Name is required',
    },
    {
      id: 'TC16',
      missing: 'last name',
      details: { ...config.CHECKOUT_INFO, lastName: '' },
      error: 'Last Name is required',
    },
    {
      id: 'TC17',
      missing: 'postal code',
      details: { ...config.CHECKOUT_INFO, postalCode: '' },
      error: 'Postal Code is required',
    },
  ];

  // One parameterized test covers TC15, TC16 and TC17.
  for (const c of requiredFieldCases) {
    test(`${c.id} checkout shows an error when ${c.missing} is missing`, async ({
      loggedIn,
      inventoryPage,
      cartPage,
      checkoutPage,
    }) => {
      await inventoryPage.addToCart(BACKPACK);
      await inventoryPage.openCart();
      await cartPage.checkout();

      await checkoutPage.fillDetails(c.details);
      await checkoutPage.continueToOverview();

      await expect(checkoutPage.error).toContainText(c.error);
      await expect(checkoutPage.subtotalLabel).toHaveCount(0); // did not reach the overview
    });
  }
});

test.describe('Security', () => {
  test('TC20 products page cannot be opened by URL after logout', async ({
    loggedIn,
    loginPage,
    inventoryPage,
  }) => {
    await inventoryPage.logout();
    await expect(loginPage.loginButton).toBeVisible();

    await inventoryPage.goto(); // type the products URL directly

    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.error).toContainText('when you are logged in');
    await expect(inventoryPage.items).toHaveCount(0);
  });
});
