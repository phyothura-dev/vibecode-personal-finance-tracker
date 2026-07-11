# State Management: Personal Finance Tracker

This document explains the state architecture, synchronization layers, caching, and performance optimization techniques implemented inside the application.

---

## 🗃️ React State Architecture

The application adopts a **Centralized Orchestrator Pattern**. State variables that drive multiple pages are kept in the parent `src/App.tsx` component and distributed via props down to child components.

### 🌟 State Stores in `App.tsx`

| State Hook | Type | Description |
| :--- | :--- | :--- |
| `user` | `User \| null` | Stores the active Firebase Auth user credentials. |
| `profile` | `UserProfile \| null` | Customized profile preferences (name, photo, currency, goals). |
| `categories` | `Category[]` | List of custom income and expense categories. |
| `incomes` | `Income[]` | All logged income records for the authenticated user. |
| `expenses` | `Expense[]` | All logged expense records for the authenticated user. |
| `loading` | `boolean` | Global app loading gate. Ensures views don't mount until all database listeners have resolved. |
| `activeTab` | `string` | Tracks the active view route (e.g. `'dashboard'`, `'incomes'`). |
| `toast` | `{ message: string; type: 'success'\|'error' } \| null` | Holds temporary floating notification parameters. |

---

## 🔄 Dynamic Synchronization Loop

We utilize Firebase's WebSocket-backed `onSnapshot` queries. This binds local state directly to the cloud store:

```text
  ┌────────────────────────────────────────────────────────┐
  │                 Cloud Firestore (Single source)        │
  └───────────────────────────┬────────────────────────────┘
                              │
                    Triggers event on write
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 App.tsx Real-Time Listeners             │
  │  (unsubProfile, unsubCategories, unsubIncomes...)      │
  └───────────────────────────┬────────────────────────────┘
                              │
                     Mutates state hooks
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                     React Virtual DOM                  │
  │      Re-renders and updates components down the tree   │
  └────────────────────────────────────────────────────────┘
```

1. **State Isolation**: Sub-components like `ExpenseManager` are purely presentation-focused. They receive lists (e.g., `expenses`) and invoke parent-provided callback handlers (e.g., `onDelete`) when actions occur.
2. **Deterministic UI Updates**: The state orchestrator performs database operations. Since listeners are actively attached, the UI automatically updates.

---

## ⚡ Performance & Re-render Optimizations

To maintain 60FPS animations and fast page loads, the application implements several core React optimization guidelines:

### 1. Advanced Memoization (`useMemo`)
Heavy data manipulations, filterings, and calculations are memoized to avoid re-running complex loops on every tick:
* **`totals` calculation**: Aggregates net cash balances and summaries. Only recalculates when the reference array `incomes` or `expenses` updates.
* **`recentTransactions`**: Sorts and slices combined transaction feeds.
* **`monthlyChartData`**: Processes last-six-months groups for Recharts.
* **`categoryChartData`**: Maps expenses into categories for Pie Chart distribution.

Example implementation in `Dashboard.tsx`:
```typescript
const totals = useMemo(() => {
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance };
}, [incomes, expenses]);
```

### 2. Dependency Array Best Practices
All `useEffect` hooks employ primitive dependency values rather than deep nested objects. This completely prevents the classic "infinite render cycle" bug common in Firestore apps.

### 3. Cleanup of Stream Listeners
Real-time snapshots return an un-subscribe function. This is captured and executed during the component's unmount lifecycle to prevent resource leaks:
```typescript
useEffect(() => {
  if (!user) return;
  const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => { ... });
  return () => unsub(); // Standard unmount cleanup
}, [user]);
```
