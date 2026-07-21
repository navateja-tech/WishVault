# UniVault

> **Save products from anywhere. Organize everything in one place.**

UniVault is a universal shopping organizer. Users save products from any shopping website (Amazon, Nike, IKEA, etc.) into beautifully organized collections, replacing scattered screenshots and bookmarks with a single premium personal product library.

## Project Structure

This is a monorepo consisting of:

- `/mobile` - React Native (Expo SDK 57, TypeScript, Expo Router, NativeWind v4, Zustand, TanStack Query)
- `/backend` - FastAPI (Python 3.11+, SQLAlchemy 2.x, Alembic, PostgreSQL, BeautifulSoup4)
- `/docs` - Comprehensive documentation (Architecture, API specs, database schemas, decisions logs)

---

## Getting Started

### Development Prerequisites

- Node.js 18+ (tested with v24)
- Python 3.11+
- Docker & Docker Desktop (for PostgreSQL database)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the environment template and configure your secrets:
   ```bash
   cp .env.example .env
   ```

3. Start the PostgreSQL database and backend service:
   ```bash
   docker-compose up -d --build
   ```

The API will be available at `http://localhost:8000`. You can explore the interactive API documentation (Swagger UI) at `http://localhost:8000/docs`.

To run the backend tests:
```bash
# Setup virtual env (optional but recommended)
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
pytest
```

---

### Mobile Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

4. Start the Expo development server:
   ```bash
   npm run start
   ```

You can run it on your iOS/Android device via the Expo Go app by scanning the QR code, or run it in an emulator/simulator.
