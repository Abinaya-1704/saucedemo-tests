# Section B – AI output and client communication

## B1. Review AI-generated code

### Problems in the proposed test

1. **It does not verify that the total is correct.** `toBeTruthy()` only checks that some text was rendered. An incorrect amount, or even an unexpected label, can pass.
2. **It does not parse or compare money values.** The test never checks the subtotal, tax, or the relationship `total = item total + tax`.
3. **It does not establish a meaningful expected cart.** `text=Add to cart` is an ambiguous global locator; it adds whichever matching button Playwright finds first. The test neither names the product nor verifies cart contents.
4. **It does not confirm important transitions.** There are no assertions that login succeeded, checkout opened, or the overview is displayed before reading its total. A failed or unexpected flow is harder to diagnose.
5. **The fixed three-second sleep is unreliable.** It wastes time when the page is fast and may still be too short when it is slow. Playwright's locator actions and web-first assertions provide condition-based waits.
6. **It bypasses the project's Page Object Model.** Selectors and interactions are embedded in the test rather than using the existing page objects, making the test more brittle and duplicating application knowledge.
7. **It hard-codes environment-specific values in the test.** The URL, username, password, and checkout data should come from the project's configuration and environment-variable overrides.
8. **It uses weak test data without explaining the requirement.** The values `A`, `B`, and `1` may be accepted by this practice site, but configured checkout data makes the test clearer and easier to maintain.
9. **It has no manual case ID in its title.** The suite requires traceability between automated tests and A1 cases.

The project already configures a fresh browser context per test, failure screenshots, and HTML/JUnit reporting. Those are strengths of the existing suite, rather than omissions in this individual test.

### Rewritten test

This version follows the existing fixtures and Page Objects. It derives the expected item total from the selected products, checks the cart contents, then verifies both the displayed subtotal and the total arithmetic. The helper is deliberately local to the example so money is compared in integer cents.

```js
const { test, expect } = require('../fixtures');
const config = require('../config');

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';
const toCents = (amount) => Math.round(amount * 100);

test('TC14 cart total equals item total plus tax', async ({
  loggedIn,
  inventoryPage,
  cartPage,
  checkoutPage,
}) => {
  const expectedItemTotal =
    (await inventoryPage.priceOf(BACKPACK)) +
    (await inventoryPage.priceOf(BIKE_LIGHT));

  await inventoryPage.addToCart(BACKPACK);
  await inventoryPage.addToCart(BIKE_LIGHT);
  await expect(inventoryPage.cartBadge).toHaveText('2');

  await inventoryPage.openCart();
  await expect(cartPage.itemNames).toHaveText([BACKPACK, BIKE_LIGHT]);
  await cartPage.checkout();
  await checkoutPage.fillDetails(config.CHECKOUT_INFO);
  await checkoutPage.continueToOverview();

  const itemTotal = await checkoutPage.itemTotal();
  const tax = await checkoutPage.tax();
  const total = await checkoutPage.total();

  expect(toCents(itemTotal)).toBe(toCents(expectedItemTotal));
  expect(toCents(total)).toBe(toCents(itemTotal) + toCents(tax));
});
```

In the full TC14 test, I would also finish the order, verify the confirmation, and confirm the badge and cart are empty, as the existing suite does.

## B2. Test an AI feature

### Scenario: Test case generator

I would build an evaluation set from representative user stories, including ordinary flows, boundary conditions, negative cases, ambiguous requirements, and stories with explicit constraints. Each expected result would be reviewed by a QA subject-matter expert before being used as a reference.

| Check | Evaluation method | Scoring |
|---|---|---|
| **Coverage of required behaviors and risks** | Rubric, with human review for whether a generated case meaningfully exercises the behavior | Score each required behavior as covered or not covered. Report coverage as covered behaviors divided by total required behaviors. Critical happy-path, negative, and boundary behaviors must all be represented; missing a critical behavior fails the story. |
| **No invented requirements or expected results** | Human review against the source story and acceptance criteria | Count unsupported assertions, constraints, and assumptions. Pass only with zero material inventions. Mark ambiguous requirements as questions or clearly labeled assumptions rather than treating them as facts. |
| **No duplicate or materially redundant cases** | Automatic similarity/duplicate detection, followed by human review of flagged pairs | Score the proportion of generated cases that add distinct coverage. A duplicate is a failure unless the difference in preconditions or expected outcome is meaningful and documented. |
| **Valid, importable JSON matching the required schema** | Automatic parser and JSON Schema validation | Score valid outputs divided by total outputs. Require 100% parse and schema validity, including required fields, correct types, and permitted values; malformed or extra unsupported structure fails importability. |

I would also retain the input story, model/version, generated output, evaluation results, and reviewer notes so that regressions can be compared after prompts or models change.

## B3. Defect report

**Title:** `[4.2.0] Price (low to high) sorting places a $29.99 item before a $15.99 item`

**Environment:** Release 4.2.0; Chrome (record the exact Chrome version, OS, test date/time, and environment/build URL when filing).

**Preconditions:** Open the shop as a valid, unlocked user with the standard product catalogue.

**Steps to reproduce:**
1. Open the products page.
2. Select **Price (low to high)**.
3. Compare the displayed prices for the full product list.
4. Repeat the sort to confirm whether the ordering is consistent.

**Expected:** Every product is in nondecreasing price order. A product priced at $15.99 appears before a product priced at $29.99.

**Actual:** A product priced at $29.99 appears before a product priced at $15.99. Per the report scenario, this has reproduced on every run since release 4.2.0.

**Severity:** Major (proposed). Price sorting is a stated core shopping function, and the incorrect order can mislead customers about which products are least expensive. Customers can work around it by manually comparing prices or using another sort mode, so it does not prevent every purchase.

**Priority:** P1 (proposed for release triage because the defect is reproducible on every run since 4.2.0). Confirm the final severity and priority against the client's Jira definitions and release-impact assessment.

**Evidence to attach:** Screenshot or short recording of the complete sorted list with both prices visible; exact reproduction steps and run timestamp; browser/OS/build details; and the automated test output or a captured list of all product names and prices in displayed order. If available, attach the failing test report and browser console/network logs with any customer data or secrets removed.

**Reporter note:** This is the defect scenario supplied by the assessment. The current public Sauce Demo run in this workspace passed TC08; that does not verify a separate 4.2.0 client release. Reproduce against the client's stated 4.2.0 environment before filing it as an independently observed defect.

## B4. Message to the client

> Hi, our release checks found two risks: price sorting has consistently shown products out of order since 4.2.0, and checkout fails intermittently (about 1 run in 10). A passing rerun does not remove the checkout risk for customers. I recommend we do not make a full Friday release until both issues are understood and the critical checkout flow is stable. If Friday timing is important, a safer alternative is a limited, monitored rollout after a focused fix and verification, with a clear rollback plan; otherwise, keep the current release live and move the launch while we retest. I’ll share the reproduction evidence, customer impact assessment, and an update after the next verification run.

(113 words)

## Section C – Live discussion preparation

### C1. How I analyze a checkout issue

I would first acknowledge the report and establish scope: when the failures began, which users or regions are affected, the exact checkout step and error, frequency, business impact, and whether there is a safe workaround. I would ask for a correlation/request ID and a sanitized example, not passwords or payment details.

I would check service and browser logs, error rates and latency, dependency/availability dashboards, recent deployments and configuration changes, incident alerts, and recent test results. I would compare successful and failed requests and identify whether failures cluster by release, browser, account/data, region, or time. I would attempt a controlled reproduction in an approved test environment using a fresh session and representative test data, then narrow the failing step while preserving evidence.

To separate causes, I would compare environments and builds, validate the test data and account state, inspect dependency health and configuration, and check whether independent users and clients reproduce the same behavior. A defect is more likely when valid inputs fail consistently on the affected product build; data or environment issues are more likely when failures follow a particular account, dataset, dependency, or environment. I would keep the client updated at an agreed cadence, state what is confirmed versus still a hypothesis, provide impact and mitigation options, and escalate immediately if customer transactions or data integrity are at risk. After identifying the cause, I would verify the fix, monitor recovery, and document prevention actions.

### C2. Recent production issue

In a logistics application, I identified a production issue in the customer booking flow. Customers could search the rates needed for a booking, but the booking ID was not generated or shown in the UI, leaving them without a completed, traceable booking.

I investigated the flow across the UI and backend and found that the booking ID API was not being called. Because the UI depended on that response to display the ID, the user saw no booking confirmation. The confirmed cause was the missing API call; I would avoid claiming a more specific technical cause unless supported by the logs or the engineering investigation.

I would raise this promptly with the development/backend team and the product or client contact, sharing the affected flow, reproduction steps, timestamp, and available request/log evidence. In non-technical terms, I would explain that customers could enter booking details but were not receiving the reference number needed to confirm and track the booking. I would clarify the number of affected bookings and any recovery path with the team before communicating those details.

To reduce recurrence, I would add an integration or contract check that verifies the booking-ID API is invoked and returns a valid ID, plus an end-to-end test that verifies the ID appears in the booking confirmation. I would also recommend monitoring failed or missing booking-ID responses and showing a clear recoverable error rather than leaving the customer uncertain. These are prevention steps I would put forward; I do not have confirmed details here about which were implemented or whether they have since caught another issue.

Looking back, I would capture the API request/correlation ID and the UI state at the time of failure as soon as the issue is reproduced, agree on impact and recovery with the product team, and keep stakeholders updated until the fix is verified in production.
