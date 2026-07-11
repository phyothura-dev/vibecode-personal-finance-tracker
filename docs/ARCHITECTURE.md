# System Architecture: Personal Finance Tracker

This document describes the high-level architecture, module organization, data-flow models, and technology stack powering the Personal Finance Tracker application.

---

## 🏗️ Architectural Pattern

The application is structured as a **Single Page Application (SPA)** that employs a serverless cloud backend pattern. It integrates React's declarative, state-driven UI with the real-time streaming capabilities of **Google Cloud Firebase**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (SPA)                              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                          React UI                              │   │
│   │             (Tailwind CSS, Lucide, Recharts)                   │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│                        Writes     │     Streams                        │
│                     (Async CRUD)  │  (onSnapshot)                      │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                       Firebase Web SDK                         │   │
│   │             (Local state sync & Auth token cache)              │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │ Network
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Firebase)                            │
│                                                                        │
│       ┌──────────────────────┐          ┌──────────────────────┐       │
│       │ Firebase Auth        │          │ Cloud Firestore      │       │
│       │ (Oauth, Tokens)      │          │ (JSON-like database) │       │
│       └──────────────────────┘          └──────────────────────┘       │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Design Principles
* **Direct Real-Time Synchrony**: Rather than relying on traditional REST pull-polling or manual refetch cycles, the application opens WebSockets to Firebase's document streams (`onSnapshot`). Changes propagate globally across devices within milliseconds.
* **Component Modularity**: UI responsibilities are broken down into self-contained widgets. State-mutations are bubbled up to a top-level orchestrator (`App.tsx`) that proxies calls to Firebase and distributes synchronized data downward.
* **Type-Safe Structures**: Strict TypeScript declarations represent all domain entities, preventing parsing collisions between the database schemas and UI widgets.

---

## 📂 Folder & Directory Layout

The workspace is organized to promote modularity, clear separation of concerns, and ease of navigation:

```text
/
├── docs/                        # Complete System Documentation
├── public/                      # Static assets (favicons, logos)
├── src/                         # Core Application Source
│   ├── components/              # Modular React UI Elements
│   │   ├── Auth.tsx             # Signup, Signin, Password Reset & Google Auth
│   │   ├── CategoryManager.tsx  # Income & Expense Category customizer
│   │   ├── Dashboard.tsx        # Charts, KPIs, goal meters & recent items
│   │   ├── ExpenseManager.tsx   # Expense transaction form and list
│   │   ├── Header.tsx           # Global banner, user identity & dropdowns
│   │   ├── IncomeManager.tsx    # Income transaction form and list
│   │   ├── ProfileManager.tsx   # Avatar customizer, currency and goal settings
│   │   ├── Sidebar.tsx          # Main navigation panel
│   │   ├── Toast.tsx            # Global dynamic notification system
│   │   └── TransactionHistory.tsx# Master cross-transaction search and log
│   ├── lib/                     # Infrastructure and SDK Initialization
│   │   └── firebase.ts          # Firebase clients and diagnostic error handler
│   ├── index.css                # Global styles and Tailwind configuration
│   ├── main.tsx                 # React DOM mount point
│   └── types.ts                 # Centralized system TypeScript contracts
├── firebase-applet-config.json  # Environment configurations for Firebase project
├── firebase-blueprint.json      # Standard database schema definition
├── firestore.rules              # DB read/write Authorization rules
├── package.json                 # Node dependencies and scripts
├── tsconfig.json                # TypeScript compilation parameters
└── vite.config.ts               # Bundling and pipeline configuration
```

---

## 🛠️ Module Responsibilities

| File / Directory | Scope & Responsibility |
| :--- | :--- |
| `src/main.tsx` | Entry-point script that binds the React engine to the `#root` container in `index.html`. Sets up strict-mode rendering wrappers. |
| `src/App.tsx` | **Central State Orchestrator**. Handles auth session lifecycle, runs Firebase real-time listeners for all records, coordinates layout switching, and passes write-handlers down to sub-components. |
| `src/lib/firebase.ts` | Configures and exports Firebase Auth, Firestore DB clients. Includes `handleFirestoreError` and a self-testing verification routine. |
| `src/types.ts` | Shared models including `UserProfile`, `Category`, `Income`, `Expense`, and combined `Transaction` entities. |
| `src/components/` | Self-contained user interface components. They do not maintain persistent global state; instead, they consume clean React props and issue callback triggers for mutations. |

---

## 🔄 Data Flow Model

The data flow follows an **Asynchronous Uni-directional Loop** that guarantees UI consistency:

1. **User Action**: A user logs an expense via `ExpenseManager`.
2. **Dispatch Event**: `ExpenseManager` validates the form inputs and invokes the `onAdd` callback prop.
3. **Database Write**: The main orchestrator (`App.tsx`) handles the event and issues an asynchronous database query via `addDoc` to the target sub-collection: `users/{uid}/expenses`.
4. **Cloud Execution**: Cloud Firestore writes the record, updates internal indices, and triggers change listeners.
5. **Reactive Broadcast**: The open listener (`onSnapshot`) in `App.tsx` receives the real-time payload update from the database.
6. **State Mutation**: The listener updates React state variables (`setExpenses(...)`).
7. **UI Redraw**: React propagates the state downward. The `Dashboard` and charts automatically redraw with the updated figures.
