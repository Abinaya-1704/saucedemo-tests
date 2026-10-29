<<<<<<< HEAD
# Sauce Demo: Shop and Check Out (manual + automated tests)

Test suite for the use case *"As a registered customer, I want to log in, browse and sort products, add them to my cart and check out, so that I can place an order."* against the public practice site https://www.saucedemo.com.

- Manual suite (A1): [TEST_CASES.md](TEST_CASES.md)
- Automation (A2): Playwright with JavaScript (`@playwright/test`)
- Section B answers and Section C preparation: [ANSWERS.md](ANSWERS.md)
- AI usage log: [AI_USAGE.md](AI_USAGE.md)

## Setup

Requires Node.js 18 or newer.

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npx playwright test                 # run all tests (headless Chromium)
npx playwright test --headed        # watch the browser
npx playwright test -g "TC14"       # run one case by its ID
npx playwright test --grep @smoke   # smoke tests only
npx playwright show-report reports/html   # open the HTML report
```

On Windows PowerShell, if script execution blocks `npm.ps1`, use the command shim:

```powershell
npm.cmd install
npx.cmd playwright install chromium
npm.cmd test
npm.cmd run test:headed
```

`npm.cmd run test:headed` opens Chromium visibly while the suite runs. If `npm.cmd` is not recognized, install Node.js LTS, reopen the terminal so it picks up the updated PATH, and retry.

Reports and failure evidence:
- HTML report: `reports/html/index.html`
- JUnit XML: `reports/junit.xml`
- A screenshot is saved for every failing test in `test-results/` and attached to the HTML report. A trace is kept too.

## Configuration

The base URL, users and checkout details live in `config.js`. Each value can be overridden with an environment variable, so nothing is hard-coded in the tests:

| Variable | Default |
|---|---|
| `BASE_URL` | `https://www.saucedemo.com` |
| `SAUCE_PASSWORD` | shared password shown on the login page |
| `STANDARD_USER` | `standard_user` |
| `LOCKED_OUT_USER` | `locked_out_user` |
| `CHECKOUT_FIRST_NAME` / `CHECKOUT_LAST_NAME` / `CHECKOUT_POSTAL_CODE` | `Abinaya` / `V` / `641601` |

Example: `BASE_URL=https://www.saucedemo.com npx playwright test`

## Structure

```
config.js              base URL, users, checkout data (env overridable)
fixtures.js            page objects and a "loggedIn" fixture
pages/                 Page Object Model: all locators live here
tests/shop.spec.js     the tests (no locators in the test bodies)
playwright.config.js   reporters, screenshot on failure, test id attribute
```

Each test gets a fresh browser context, so it starts logged out with an empty cart. Tests do not depend on each other and can run alone or in any order. There are no fixed sleeps: the tests use Playwright's auto-waiting and retrying `expect` assertions.

## Traceability: manual case to automated test

| Manual case | Automated test (`tests/shop.spec.js`) |
|---|---|
| TC01 | `TC01 standard user logs in` |
| TC02 | `TC02 locked-out user sees an error` |
| TC03 | `TC03 wrong password is rejected` |
| TC04 | manual only |
| TC05 | manual only |
| TC06 | manual only |
| TC07 | manual only |
| TC08 | `TC08 sorts by price low to high (whole list checked)` |
| TC09 | `TC09 sorts by price high to low (whole list checked)` |
| TC10 | covered by `TC11 add two items and remove one: badge and cart contents` (asserts the badge is 1 after the first item) |
| TC11 | `TC11 add two items and remove one: badge and cart contents` |
| TC12 | manual only |
| TC13 | manual only |
| TC14 | `TC14 full checkout: total equals item total plus tax, cart empty afterwards` |
| TC15 | `TC15 checkout shows an error when first name is missing` |
| TC16 | `TC16 checkout shows an error when last name is missing` |
| TC17 | `TC17 checkout shows an error when postal code is missing` |
| TC18 | manual only |
| TC19 | manual only (waiting for the product owner's answer) |
| TC20 | `TC20 products page cannot be opened by URL after logout` |
| TC21 | manual only |
| TC22 | manual only |
| TC23 | manual only |
| TC24 | manual only |
| TC25 | manual only (exploratory charter) |

TC08/TC09 and TC15 to TC17 are each generated from one data table in the spec, so each group is one parameterized test.

## Assumptions

- Tax is 8% of the item total. The tests do not hard-code the rate. They check that total = item total + tax, using the amounts shown on the overview page.
- The practice site shows its test users and password on the login page, so keeping the password in `config.js` is acceptable here. For a real client system it would come from environment variables or a secrets store only.

## How the suite would grow to 200 tests

I would keep one page object per page and move shared flows (log in, add items, reach checkout) into fixtures, so new tests stay short. Tests would be tagged (`@smoke`, `@regression`) and split into files by area (login, inventory, cart, checkout, security). Test data would live in JSON files or factory functions, not inside the tests. Playwright already runs files in parallel; in CI I would run the smoke tag on every commit, the full regression nightly, and shard it across machines with `--shard`. I would add more browsers as Playwright projects, publish the HTML and JUnit reports from the pipeline, and track flaky tests, fixing or quarantining them quickly. Anything about prices or tax rules would move to API or unit tests, so the UI suite stays small and fast.
=======
# saucedemo-tests
.gitignore
>>>>>>> 9e9772f158e47214752591b61a303e2eb245809b
