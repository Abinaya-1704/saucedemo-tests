const config = require('../config');

// Values of the sort dropdown on the site.
const SORT = {
  NAME_AZ: 'az',
  NAME_ZA: 'za',
  PRICE_LOW_HIGH: 'lohi',
  PRICE_HIGH_LOW: 'hilo',
};

// '$29.99' -> 29.99 (prices are compared as numbers, never as strings)
const parsePrice = (text) => Number(text.replace('$', '').trim());

class InventoryPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async goto() {
    await this.page.goto(config.INVENTORY_PATH);
  }

  item(name) {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async addToCart(name) {
    await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(name) {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy(optionValue) {
    await this.sortDropdown.selectOption(optionValue);
  }

  async prices() {
    await this.itemPrices.first().waitFor();
    return (await this.itemPrices.allTextContents()).map(parsePrice);
  }

  async priceOf(name) {
    const text = await this.item(name).getByTestId('inventory-item-price').innerText();
    return parsePrice(text);
  }

  async openCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}

module.exports = { InventoryPage, SORT };
