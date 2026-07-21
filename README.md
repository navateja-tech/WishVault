# UniVault

> **Save products from anywhere. Organize everything in one place.**

UniVault is a universal shopping organizer monorepo. It empowers users to save products from any shopping website (e.g. Amazon, Nike, IKEA, Sephora) into customized, premium collections, replacing scattered screenshots and web bookmarks with a singular, beautiful library.

---

## 🏗️ Architecture Overview

The codebase is organized as a monorepo consisting of:

- **[`/backend`](file:///n:/VS-code/UniVault/backend)**: Async FastAPI server (Python 3.11) backed by SQLAlchemy 2.0 ORM, Alembic migrations, SlowAPI rate-limiting, and PostgreSQL. Features a custom multi-engine async scraping pipeline (OpenGraph, JSON-LD, standard meta tags, and BeautifulSoup heuristics fallback).
- **[`/mobile`](file:///n:/VS-code/UniVault/mobile)**: Premium React Native mobile application built on Expo SDK 57, TypeScript, Expo Router (file-based navigation), NativeWind v4 (Tailwind CSS), Zustand state store, and TanStack React Query. Features interactive haptics, pull-to-refresh, custom modals, and inline editable forms.
- **[`/docs`](file:///n:/VS-code/UniVault/docs)**: System architecture diagrams, OpenAPI specifications, and database schema mappings.

---

## ⚡ Setup & Installation

### Prerequisites
- Node.js 18+ (tested with v20+)
- Python 3.11+
- Docker & Docker Compose

---

### 1. Backend Setup & Database Migrations

Navigate to the `backend/` directory:
```bash
cd backend
```

Create a virtual environment and install dependencies:
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

#### Run Database Migrations
Initialize local database schema migrations using Alembic:
```bash
alembic upgrade head
```

#### Running FastAPI Dev Server
Start the development server:
```bash
uvicorn app.main:create_app --factory --reload --host 127.0.0.1 --port 8000
```
- Interactive API Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- API endpoints prefix: `/api/v1`

---

### 2. Mobile App Setup

Navigate to the `mobile/` directory:
```bash
cd mobile
```

Install React Native dependencies:
```bash
npm install
```

Configure your local backend base URL environment variable in `.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Start the Expo bundler:
```bash
npm run start
```
Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code using the Expo Go application.

---

## 🧪 Automated Testing

We maintain a high-quality test suite for the FastAPI backend using `pytest` and transaction-isolated SQLite databases to guarantee API security and data model sanity.

Run the test suite from the `backend/` directory:
```bash
$env:PYTHONPATH="."
.venv\Scripts\pytest -v
```

All 21 integration tests validating Registration, JWT Auth tokens, Session Refresh, Collections CRUD, and Scraper Fallbacks should pass:
```text
tests/auth/test_auth.py::test_register_success PASSED
tests/auth/test_auth.py::test_login_success PASSED
tests/collections/test_collections.py::test_create_collection_success PASSED
tests/products/test_products.py::test_save_product_success PASSED
...
============================= 21 passed in 10.89s =============================
```

---

## 🔍 Manual Verification Test Cases

To verify the functionality of the system end-to-end, execute the following manual testing steps:

### Test Case 1: Registration & Authentication
1. Launch the mobile app and navigate to **Sign Up**.
2. Register with a new email, username, and password.
3. Verify you are automatically logged in and redirected to the main dashboard.
4. Close and re-launch the application. Check that you are still authenticated (verified via `SecureStore` persistence).
5. Navigate to the **Profile** tab and click **Log Out**. Confirm the dialog. Verify you are redirected back to the **Login** screen.

### Test Case 2: Creating and Managing Collections
1. Log in, navigate to the **Collections** tab, and click the **`+` (Add)** button.
2. Type "Tech Gadgets", pick a pink color, choose the laptop icon emoji, and save.
3. Verify the "Tech Gadgets" card appears immediately.
4. Press the `...` menu on the card, select **Edit**, change the name to "Dream Setup", and choose the sparkles icon. Save and verify updates.
5. Create a second collection named "Fashion" with a shirt icon. Verify the list is ordered alphabetically.

### Test Case 3: Saving a Product & Scraping Metadata
1. Go to the dashboard or collections, tap **`+`** (or navigation action to save product).
2. Copy a product link (e.g. `https://www.ikea.com/us/en/p/markus-office-chair-glose-black-00103102/` or any product link).
3. Tap **Paste** inside the input, then tap **Get Product Preview**.
4. Verify the loading skeleton animates and returns the title, domain website tag, currency, price, and cover image.
5. Under **Select Collection**, tap "Dream Setup". Add a personal note "Need to buy for my office desk".
6. Tap **Save to UniVault**. Verify you are returned to the dashboard.

### Test Case 4: Dashboard Views & Detail Pages
1. On the dashboard, verify your newly saved chair appears under "Recently Saved" horizontally, and also inside "My Items".
2. Toggle between **Grid View** and **List View** layouts using the top switcher.
3. Tap on the product card. Verify it displays a full screen detail sheet with the hero image, price, original URL store button, and custom notes.
4. Edit the notes description, click **Save** in the top right. Verify notes updated in the database.
5. Change the collection category badge to "Fashion". Go back and verify collection counts on the collections tab synced correctly.

### Test Case 5: Dynamic Search & Filtering
1. Go to the **Search** tab.
2. Type "Desk" or "Office" in the search input. Verify list filters in real-time.
3. Tap the **Filter** icon button. Select "Dream Setup" collection. Verify results filter.
4. Select the "$50 - $200" price filter preset. Verify the listing updates to display items strictly matching both search query, collection category, and price range.
