// 'Item total: $39.98' -> 39.98
const money = (text) => {
  const match = text.match(/\$([\d,]+\.\d{2})/);
  if (!match) throw new Error(`No amount found in: ${text}`);
  return Number(match[1].replace(/,/g, ''));
};

// Covers step one (your information), step two (overview) and the confirmation page.
class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.error = page.getByTestId('error');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
  }

  async fillDetails({ firstName, lastName, postalCode }) {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.postalCode.fill(postalCode);
  }

  async continueToOverview() {
    await this.continueButton.click();
  }

  async itemTotal() {
    return money(await this.subtotalLabel.innerText());
  }

  async tax() {
    return money(await this.taxLabel.innerText());
  }

  async total() {
    return money(await this.totalLabel.innerText());
  }

  async finish() {
    await this.finishButton.click();
  }
}

module.exports = { CheckoutPage };
