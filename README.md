# Panruti Cashews – Order App

A lightweight web app for taking cashew orders from residents of nearby apartments. Customers place orders from a simple mobile-friendly form, and the seller tracks, edits and closes those orders from a private admin dashboard. Everything runs in the browser against Firebase, with no backend server to maintain.

**Live site:** https://cashew-orders.web.app/ (admin: `/admin.html`)

## Features

### Customer order page (`index.html`)
- Shows the current product and price, updated live from the database
- Order form: mobile number (10 digits, numbers only), apartment, flat number and quantity (1–5 half-kg packets). All fields are mandatory.
- When a mobile number with an open order is entered, that order is shown with **Modify Order** and **Cancel Order** buttons. A number can have only one open order at a time.
- While placing a new order, once the apartment and flat number are filled in, the page checks for an open order for that flat (matched ignoring case, spaces and punctuation). If one exists, it shows "An order already exists" with that order's details and **Modify Order** / **Cancel Order**, instead of creating a second order. A "Not your order? Change the flat number" link goes back to the form. The same check runs again on submit, and when an order is modified to a different flat.
- After an order is placed or updated, the page keeps the mobile number and shows the order details with **Modify Order** and **Cancel Order**, so the customer can change or cancel it straight away.
- When the admin has frozen orders, a notice says that order placement is closed and existing orders cannot be modified or cancelled. The order form is hidden; a customer can still enter their mobile number to see their open order, but without the Modify/Cancel buttons.
- Running total calculated as the quantity changes (an order being modified keeps the price it was placed at)
- A pop-up notification when an order is placed, updated or cancelled, and an error message if something fails
- A contact number at the bottom of the page for order details or enquiries (a tap-to-call link; change it in the footer of `index.html`)

### Admin dashboard (`admin.html`)
- Email/password sign-in (Firebase Authentication)
- Edit the product name and price shown to customers
- **Freeze Orders / Unfreeze Orders** button (with confirmation). While frozen, customers cannot place, modify or cancel orders; the admin can still edit, deliver and delete them.
- Summary of open orders and the total amount pending
- Open / Closed / Cancelled / All tabs, with orders updating in real time
- Each order shows the customer's mobile number as a tap-to-call link
- **Reopen Order** on closed and cancelled orders, which puts them back in Open. If the customer's number has no other open order, the customer page shows the reopened order again; if it does, the admin is warned before reopening.
- While signed in, the dashboard creates any missing `openFlats` pointers for open orders (for example orders placed before this feature, reopened orders, or orders the admin moved to another flat), so customers can find them by flat.
- Open orders that share an apartment and flat number with another open order are outlined in red with a "Possible duplicate" warning, so they can be checked manually. Flat numbers are matched ignoring case, spaces and punctuation (`A-204` matches `a 204`).
- Mark an order as delivered, edit its apartment, flat number and quantity (the mobile number is shown read-only), or delete it (with confirmation)

### Both pages
- Sun/moon toggle for light and dark mode, which follows the system setting by default and remembers your choice
- Responsive layout for phones and desktops

### Security
Access is enforced by [firestore.rules](firestore.rules), not by hiding the admin page:
- Anyone can create an order, but only with valid fields (10-digit mobile number, known apartment, non-empty flat number, quantity 1–5, status `open`).
- Anyone can fetch a single order by its ID, but only a signed-in admin can list orders. The customer page finds an order through `openOrders/{mobile}`, a small document holding the ID of that number's open order. It can only point at an open order placed with the same number.
- While orders are frozen (`config/settings.ordersFrozen` is `true`), customers cannot create, edit or cancel orders. Only a signed-in admin can change this setting.
- While an order is open, the customer can change its apartment, flat number and quantity, or cancel it (status `cancelled`). Only a signed-in admin can mark orders delivered, reopen closed or cancelled orders, edit closed orders or delete orders.
- `openFlats/{flatKey}` works the same way for an apartment + flat, so the customer page can find an open order for a flat. It can only point at an open order for that same flat.
- Because there is no customer sign-in, anyone who knows a mobile number, or an apartment and flat number, can see, change or cancel that open order.
- Anyone can read the product; only a signed-in admin can change it.

## Tech used

| Area | Technology |
| --- | --- |
| Front end | Plain HTML, CSS and JavaScript (ES modules), with no build step or framework |
| Database | Cloud Firestore (`orders`, `openOrders` and `openFlats` collections, `config/product` and `config/settings` documents) |
| Auth | Firebase Authentication (email/password) for the admin |
| Hosting | Firebase Hosting, serving the `public/` folder |
| Firebase SDK | v10.14.1, loaded from the gstatic CDN |
| Local dev server | Python 3 (see `.vscode/dev_server.py`) |

## Project structure

```
public/
  index.html          Customer order page
  admin.html          Admin login and orders dashboard
  firebase-config.js  Firebase project settings (not secret)
  flat-key.js         Builds the apartment + flat key shared by both pages
  style.css           Shared styles, including dark mode
  theme.js            Dark mode toggle
  logo.png            App logo
firebase.json         Hosting and Firestore config
.firebaserc           Firebase project alias (cashew-orders)
firestore.rules       Database security rules
.vscode/              Local server and Chrome debug setup
```

## Running locally

### Prerequisites
- Python 3 on your PATH
- Windows PowerShell (for the VS Code start script)
- Optional: Visual Studio Code, and Google Chrome for debugging

The app talks to the live Firebase project even when run locally, so **orders placed locally are real orders**.

### Option 1: VS Code (recommended)
1. Open the project folder in VS Code.
2. Open **Run and Debug** and choose **Launch Chrome against localhost** (customer page) or **Launch Chrome (admin page)**.
3. Press **F5**. This starts the local server on port 5173 and opens Chrome.

The start script ([.vscode/start-server.ps1](.vscode/start-server.ps1)) stops any old server left on port 5173 and serves `public/` with caching turned off, so changes show on a normal refresh.

### Option 2: Command line
From the project folder:

```powershell
powershell -ExecutionPolicy Bypass -File .vscode\start-server.ps1
```

Then open:
- Customer page: http://localhost:5173/index.html
- Admin page: http://localhost:5173/admin.html

## Deploying

Deployment is manual, using the [Firebase CLI](https://firebase.google.com/docs/cli). Always deploy from `main`, after the feature branch has been merged, so the live site always matches `main`:

```bash
npm install -g firebase-tools   # once
firebase login                  # once

git checkout main
git pull
firebase deploy --only firestore:rules  # publish database rule changes
firebase deploy --only hosting          # publish the website (customer and admin pages)
```

Deploy the rules before the website, so any new fields or edits the pages rely on are already allowed.

Pushing to GitHub does **not** update the live site.

## First-time setup (new Firebase project)

To run this against your own Firebase project instead of `cashew-orders`:

1. Create a Firebase project and add a web app.
2. Copy the web app's config into [public/firebase-config.js](public/firebase-config.js), and update the project ID in [.firebaserc](.firebaserc).
3. Enable **Cloud Firestore** and **Authentication → Email/Password**.
4. In the Firebase console, add a user under Authentication. This is the admin login.
5. Deploy the rules and site with `firebase deploy`.
6. Sign in to `admin.html`. On first sign-in it creates the product with a default name and price, which you can then edit. The customer page shows "Loading…" until this has happened.

## Notes
- **Changing apartments or the quantity limit:** these appear in [public/index.html](public/index.html), in the order edit form in [public/admin.html](public/admin.html), and in [firestore.rules](firestore.rules). Update all three and redeploy the rules.
- **Changing the logo:** after replacing `public/logo.png`, bump the `?v=` number in its `<img>` tags in `index.html` and `admin.html` so browsers fetch the new image.
