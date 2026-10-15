# Panruti Cashews – Order App

A lightweight web app for taking cashew orders from residents of nearby apartments. Customers place orders from a simple mobile-friendly form, and the seller tracks, edits and closes those orders from a private admin dashboard. Everything runs in the browser against Firebase, with no backend server to maintain.

**Live site:** https://cashew-orders.web.app/ (admin: `/admin.html`)

## Features

### Customer order page (`index.html`)
- Shows the current product and price, updated live from the database
- Order form: mobile number (10 digits, numbers only), apartment, flat number and quantity (1–5 half-kg packets). All fields are mandatory.
- When a mobile number with an open order is entered, that order is shown with **Modify Order** and **Cancel Order** buttons. A number can have only one open order at a time.
- Running total calculated as the quantity changes (an order being modified keeps the price it was placed at)
- A pop-up notification when an order is placed, updated or cancelled, and an error message if something fails

### Admin dashboard (`admin.html`)
- Email/password sign-in (Firebase Authentication)
- Edit the product name and price shown to customers
- Summary of open orders and the total amount pending
- Open / Closed / Cancelled / All tabs, with orders updating in real time
- Each order shows the customer's mobile number as a tap-to-call link
- Mark an order as delivered, edit its details, or delete it (with confirmation)

### Both pages
- Sun/moon toggle for light and dark mode, which follows the system setting by default and remembers your choice
- Responsive layout for phones and desktops

### Security
Access is enforced by [firestore.rules](firestore.rules), not by hiding the admin page:
- Anyone can create an order, but only with valid fields (10-digit mobile number, known apartment, non-empty flat number, quantity 1–5, status `open`).
- Anyone can fetch a single order by its ID, but only a signed-in admin can list orders. The customer page finds an order through `openOrders/{mobile}`, a small document holding the ID of that number's open order. It can only point at an open order placed with the same number.
- While an order is open, the customer can change its apartment, flat number and quantity, or cancel it (status `cancelled`). Only a signed-in admin can mark orders delivered, edit closed orders or delete orders.
- Because there is no customer sign-in, anyone who knows a mobile number can see, change or cancel that number's open order.
- Anyone can read the product; only a signed-in admin can change it.

## Tech used

| Area | Technology |
| --- | --- |
| Front end | Plain HTML, CSS and JavaScript (ES modules), with no build step or framework |
| Database | Cloud Firestore (`orders` and `openOrders` collections, `config/product` document) |
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
