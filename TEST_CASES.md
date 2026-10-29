# A1. Manual Test Suite: Shop and Check Out (Sauce Demo)

**Use case:** As a registered customer, I want to log in, browse and sort products, add them to my cart and check out, so that I can place an order.

**Application:** Sauce Demo (public practice store). Shared password and test users are listed on the login page.

---

## 1. Questions and assumptions

| # | Question for the product owner | Assumption I will test against |
|---|---|---|
| 1 | Is the postal code checked against a format or length? | Any non-empty value is accepted. Only an empty value is an error. |
| 2 | Is the tax a fixed percentage, and how is it rounded? | A fixed 8% of the item total, rounded to 2 decimals. Total = item total + tax. |
| 3 | Should the cart survive logout and login, or be cleared? | The cart is kept for the same browser. I will report it if behaviour is inconsistent. |
| 4 | Can a customer check out with an empty cart? | No order can be completed from an empty cart. The expected behavior is a clear validation message and no access to the order-confirmation state; confirm this with the product owner. |
| 5 | What is the default sort order, and does the sort choice persist when the user navigates away and back? | Default is Name (A to Z). The sort choice may reset. This is not treated as a defect. |
| 6 | Which browsers and screen sizes are supported? | Latest Chrome and Firefox on desktop, plus a mobile viewport of about 375 x 667. |
| 7 | Is the username case-sensitive, and is there any lockout after repeated wrong passwords? | Username and password are case-sensitive. No lockout after failed attempts, except for the locked-out user. |

---

## 2. Test cases

Test users: `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`. Password is the shared one shown on the login page (kept in config during automation).
Prices of the 6 products: 7.99, 9.99, 15.99, 15.99, 29.99, 49.99. Tax assumed to be 8%.

| ID | Area | Type | Title | Pre-conditions | Steps | Test data | Expected result | Priority | Automate? (Yes / No) and why |
|---|---|---|---|---|---|---|---|---|---|
| TC01 | Login | Positive | Standard user logs in | On the login page | 1. Enter username<br>2. Enter password<br>3. Click Login | standard_user + shared password | Products page is shown with 6 products | P1 | Yes: smoke test on every build |
| TC02 | Login | Negative | Locked-out user sees an error | On the login page | 1. Enter locked-out username and password<br>2. Click Login | locked_out_user + shared password | User stays on the login page. Error says the user has been locked out | P1 | Yes: required business rule, cheap to automate |
| TC03 | Login | Negative | Wrong password is rejected | On the login page | 1. Enter valid username with a wrong password<br>2. Click Login | standard_user + "wrong_pass" | Error says username and password do not match. No login | P1 | Yes: core security check, stable |
| TC04 | Login | Negative | Empty username and empty password | On the login page | 1. Leave both fields empty<br>2. Click Login | empty / empty | Error says username is required. No login | P2 | No: low risk, covered by TC03 pattern, check manually |
| TC05 | Login | Boundary | Username is case-sensitive | On the login page | 1. Enter username in upper case<br>2. Enter valid password<br>3. Click Login | STANDARD_USER + shared password | Login is rejected with the mismatch error | P3 | No: edge case, run manually once per release |
| TC06 | Sorting | Positive | Default sort is Name (A to Z) | Logged in as standard user | 1. Open the products page<br>2. Read the sort dropdown and product order | standard_user | Dropdown shows Name (A to Z). Products are in A to Z order | P2 | No: covered by the Z to A / price sorts, quick visual check |
| TC07 | Sorting | Positive | Sort by Name (Z to A) | Logged in, on products page | 1. Select Name (Z to A)<br>2. Read all product names | standard_user | All 6 names are in reverse alphabetical order | P2 | No: same mechanism as price sort, kept manual to limit scope |
| TC08 | Sorting | Positive | Sort by price low to high | Logged in, on products page | 1. Select Price (low to high)<br>2. Read all 6 prices | standard_user | Whole list is in ascending price order, not only the first item | P1 | Yes: required, check the whole list |
| TC09 | Sorting | Positive | Sort by price high to low | Logged in, on products page | 1. Select Price (high to low)<br>2. Read all 6 prices | standard_user | Whole list is in descending price order | P1 | Yes: same parameterized test as TC08 |
| TC10 | Cart | Positive | Add one item updates the badge | Logged in, empty cart | 1. Click Add to cart on one product<br>2. Check the badge before adding another item | standard_user | Button changes to Remove. Cart badge shows 1 | P1 | Yes: verified as the first step of TC11 |
| TC11 | Cart | Positive | Add two items and remove one | Logged in, empty cart | 1. Add product A and verify badge shows 1<br>2. Add product B and verify badge shows 2<br>3. Remove product A on the products page and verify badge shows 1<br>4. Open the cart | standard_user | Badge progresses from 1 to 2 to 1. Cart contains only product B | P1 | Yes: required, checks badge and cart contents |
| TC12 | Cart | Positive | Remove an item from the cart page | Logged in, 2 items in cart | 1. Open the cart<br>2. Click Remove on one item | standard_user | Item disappears. Badge decreases by 1 | P2 | No: remove logic is covered by TC11, manual check |
| TC13 | Cart | Boundary | Add all 6 products | Logged in, empty cart | 1. Add all 6 products<br>2. Open the cart | standard_user | Badge shows 6. Cart lists 6 items | P3 | No: boundary case, low risk |
| TC14 | Checkout | Positive | Full checkout with correct total and empty cart afterwards | Logged in, 2 items in cart | 1. Open the cart and click Checkout<br>2. Enter first name, last name, postal code<br>3. Click Continue<br>4. Check item total, tax, total<br>5. Click Finish | Abinaya / V / 641601 | Total = item total + tax. Confirmation page is shown. Cart is empty and badge is gone | P1 | Yes: main revenue flow, regression on every build |
| TC15 | Checkout | Negative | Missing first name | Logged in, item in cart, on checkout step one | 1. Leave first name empty, fill the others<br>2. Click Continue | "" / V / 641601 | Error says first name is required. No navigation | P1 | Yes: one parameterized test with TC16 and TC17 |
| TC16 | Checkout | Negative | Missing last name | Same as TC15 | 1. Leave last name empty, fill the others<br>2. Click Continue | Abinaya / "" / 641601 | Error says last name is required | P1 | Yes: same parameterized test |
| TC17 | Checkout | Negative | Missing postal code | Same as TC15 | 1. Leave postal code empty, fill the others<br>2. Click Continue | Abinaya / V / "" | Error says postal code is required | P1 | Yes: same parameterized test |
| TC18 | Checkout | Negative | Cancel on overview does not place the order | On the overview page with items | 1. Click Cancel | standard_user | User goes back to the products page. Order is not placed. Cart is unchanged | P2 | No: lower risk, kept manual |
| TC19 | Checkout | Boundary | Checkout with an empty cart | Logged in, empty cart | 1. Open the cart<br>2. Attempt to proceed through checkout | standard_user | An order cannot be completed. The user receives a clear validation message and remains outside the order-confirmation state | P2 | No: assumption Q4 needs product-owner confirmation; keep manual until confirmed |
| TC20 | Security | Negative | Open products page by URL after logout | User has logged out | 1. Log out<br>2. Type the products page URL in the address bar | Direct URL of the inventory page | User is sent to the login page with an error that login is required. Products are not shown | P1 | Yes: required, protects against unauthorised access |
| TC21 | Security | Negative | Browser Back after logout | User has just logged out | 1. Click the browser Back button | standard_user | Products page is not shown with live data. Login page remains | P2 | No: browser behaviour, check manually per browser |
| TC22 | Usability | Positive | Error messages are clear and can be dismissed | On the login page | 1. Trigger a login error<br>2. Click the X on the message | locked_out_user | Message is readable and in plain language. X closes it. Fields stay highlighted until corrected | P3 | No: subjective, human judgement |
| TC23 | Screen size | Positive | Mobile viewport layout | Logged in | 1. Resize to 375 x 667<br>2. Browse, add to cart, open the cart | standard_user | No overlapping or hidden elements. All buttons are reachable. Checkout works | P2 | No: visual check, needs real devices |
| TC24 | Accessibility | Positive | Keyboard-only login and add to cart | On the login page | 1. Use Tab and Enter only to log in<br>2. Tab to a product and press Enter to add it | standard_user | Visible focus on each element. All actions work without a mouse. Fields have labels | P2 | No: needs a screen reader and a human, use axe as a helper |
| TC25 | Exploratory | Exploratory | 15-minute charter with problem_user | On the login page | See the charter below | problem_user | Defects and observations are noted | P2 | No: exploratory by nature |

### Exploratory charter (TC25), 15 minutes

- **Mission:** Explore the full shop flow as `problem_user` to find defects in product images, sorting, cart behaviour and checkout form.
- **Areas:** product images and names, the sort dropdown, Add/Remove buttons, cart contents against what was added, the checkout form fields, and the total.
- **Ideas to try:** add and remove several items from different pages, compare the cart with what you added, sort and then add, fill the checkout form field by field and check what is shown in each field.
- **Notes to record:** steps, screenshot, expected versus actual result, and severity. If time remains, repeat quickly with `performance_glitch_user` and note the slow pages.

---

## 3. Strategy

**UI layer (automated):** the smoke and regression flows: login (valid, locked-out, wrong password), price sorting across the whole list, add/remove with the cart badge, a full checkout with the total check, missing-field validation, and URL protection after logout.

**API or unit layer, if the client has one:** tax and total calculation, sort ordering logic, and session and authorisation checks, because they are faster and more precise there.

**Manual only:** exploratory testing with problem and performance users, accessibility, mobile layout, usability, browser Back behaviour, and the empty-cart checkout until the owner answers.

**Biggest remaining risk:** defects that appear only for problem or visual users, in other browsers or on devices, and tax errors across many item combinations. The automated suite covers one browser with a standard user.
