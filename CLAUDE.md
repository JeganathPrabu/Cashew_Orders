# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Workflow
- Work on feature branches and merge them into `main`.
- Never commit directly to `main`.
- Merging into `main` does not deploy. After a merge, remind me to deploy from `main`.

# Deployment
- Hosted on Firebase Hosting, project `cashew-orders` (https://cashew-orders.web.app).
- Deployment is manual; there is no CI/CD. Deploy only from an up-to-date `main`, never from a feature branch.
- Order: `firebase deploy --only firestore:rules`, then `firebase deploy --only hosting` (one hosting deploy publishes both the customer and admin pages).

# Documentation
- Whenever you add or change a feature, update README.md to match.

# Commands
- Run locally: `powershell -ExecutionPolicy Bypass -File .vscode\start-server.ps1`, then open http://localhost:5173/index.html or `/admin.html`. In VS Code, F5 does the same through the `start-local-server` task.
- The start script kills whatever is already listening on 5173 (a stale Python server can silently share the port on Windows) and serves `public/` through `.vscode/dev_server.py` with `Cache-Control: no-store`.
- There is no build, lint or test setup. Verify changes in the browser.
- Local runs use the **live** Firestore database, so test orders are real orders.

# Architecture
- A static site in `public/` with no build step or framework. Each page is one HTML file with its logic in an inline `<script type="module">`, importing the Firebase v10.14.1 SDK from the gstatic CDN, plus `db`/`auth` from `firebase-config.js`.
- `index.html` (customer) reads `config/product`, creates orders, and looks up, edits or cancels the open order for the entered mobile number. It never lists orders: it gets `openOrders/{mobile}`, then gets the order by ID. New orders and their pointer are written in one batch; cancelling sets `status: "cancelled"` and deletes the pointer in one batch. The pointer is left stale when the admin closes or deletes an order, so the page treats a pointer to a non-open or missing order as "no open order".
- `index.html` and `admin.html` both listen to `config/settings`. While frozen, the customer page shows a notice, hides the order fields and hides Modify/Cancel on the open-order card.
- `admin.html` has a login screen and a dashboard in the same file; `onAuthStateChanged` toggles them and starts or stops the Firestore `onSnapshot` listeners. On first login it seeds `config/product` with defaults if the doc is missing.
- Firestore data:
  - `orders/{id}`: `product`, `unitPrice`, `mobile` (10-digit string; missing on older orders), `apartment`, `flatNumber`, `quantity`, `total`, `status` (`open`/`closed`/`cancelled`), `createdAt`, `closedAt`, `cancelledAt`.
  - `openOrders/{mobile}`: `orderId` of that number's open order.
  - `config/product`: `name`, `price`.
  - `config/settings`: `ordersFrozen` (bool). Created the first time the admin freezes orders; a missing doc means not frozen. Kept separate from `config/product` because the product form overwrites that doc with `setDoc`.
- `firestore.rules` is the real access control, not the unlisted admin URL. It checks the order shape on create; allows `get` on orders to anyone but `list` only to the admin; lets the admin change only `status`/`closedAt` or only `apartment`/`flatNumber`/`quantity`/`total`; and lets anyone, while the order is `open`, make that same contents edit or set `status: "cancelled"` with `cancelledAt`. Customer creates, edits and cancels are also refused while `config/settings.ordersFrozen` is true (`ordersOpen()`); admin writes are not. `openOrders` writes must point (via `getAfter`) at an open order with the same mobile. A new order field or edit must also be allowed by the rules, or writes will fail.
- The 10-digit mobile format is checked in `index.html` and `firestore.rules`.
- The apartment list and the 1–5 quantity limit are duplicated in `index.html`, in the admin edit form inside `admin.html`, and in `firestore.rules`. Change all three together.
- `style.css` has a global `[hidden] { display: none !important; }` so the `hidden` attribute works on flex elements like `.button-row`.
- `theme.js` loads as a classic script in `<head>` to set `data-theme` before paint (no flash). It keeps every `.theme-toggle-input` in sync and stores the choice in `localStorage`. Colours are CSS variables in `style.css`, overridden under `:root[data-theme="dark"]`.
- Hosting sends no-cache headers only for html/js/css (`firebase.json`). After replacing `logo.png` or another image, bump the `?v=` query on its `<img>` tags.
