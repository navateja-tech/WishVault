# UniVault Architectural Specifications

## Monorepo Strategy
This project is structured as a light monorepo, separation between the frontend (React Native/Expo) and backend (FastAPI).

### Mobile App Architecture (Feature-Based)
The mobile app is partitioned into core folders:
1. `app/` — Router-level routing pages.
2. `features/` — Encapsulated domain submodules containing their components, state management (Zustand), API methods, hooks, types, and schemas.
3. `components/` — Shared UI elements and base layouts.
4. `constants/` — Static design tokens, styles, configs.

### Backend Architecture (Clean Architecture / Domain-Driven)
The backend is organized by business domains rather than database layers:
1. `core/` — App-wide infrastructure (database pool, config, security).
2. `common/` — Shared base models, Pydantic schemas, utilities.
3. `{domain}/` (e.g. `auth/`, `collections/`, `products/`) — Co-located models, routers, repositories, services, schemas, and scraping pipelines.

## State Management
- **Client UI state & Authentication session**: Zustand.
- **Server Cache & Async queries/mutations**: TanStack Query (React Query) v5.

## UI Styling
- Tailwind CSS v3 via NativeWind v4 for maximum efficiency and utility styling on React Native.
- Inter typography family.
- Lucide React Native rounded style icons.
