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
- `index.html` (customer) only creates documents in `orders` and reads `config/product`. It never reads orders.
- `admin.html` has a login screen and a dashboard in the same file; `onAuthStateChanged` toggles them and starts or stops the Firestore `onSnapshot` listeners. On first login it seeds `config/product` with defaults if the doc is missing.
- Firestore data:
  - `orders/{id}`: `product`, `unitPrice`, `apartment`, `flatNumber`, `quantity`, `total`, `status` (`open`/`closed`), `createdAt`, `closedAt`.
  - `config/product`: `name`, `price`.
- `firestore.rules` is the real access control, not the unlisted admin URL. It checks the order shape on create and allows two kinds of admin update: changing only `status`/`closedAt`, or changing only `apartment`/`flatNumber`/`quantity`/`total`. A new order field or admin edit must also be allowed by the rules, or writes will fail.
- The apartment list and the 1–5 quantity limit are duplicated in `index.html`, in the admin edit form inside `admin.html`, and in `firestore.rules`. Change all three together.
- `theme.js` loads as a classic script in `<head>` to set `data-theme` before paint (no flash). It keeps every `.theme-toggle-input` in sync and stores the choice in `localStorage`. Colours are CSS variables in `style.css`, overridden under `:root[data-theme="dark"]`.
- Hosting sends no-cache headers only for html/js/css (`firebase.json`). After replacing `logo.png` or another image, bump the `?v=` query on its `<img>` tags.
