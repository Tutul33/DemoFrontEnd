# SONALIERPEXT Angular 19 Application

This is a **modular Angular 19 application** designed for enterprise resource planning (ERP) functionalities. It uses **lazy-loaded modules**, **component-specific models/services/data services**, a **shared module** for reusable code, and **PrimeNG** for UI components and styles.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Modules](#modules)
- [Shared Module](#shared-module)
- [Services](#services)
- [Models](#models)
- [Pipes & Directives](#pipes--directives)
- [Global State Management & Authentication](#global-state-management--authentication)
- [Setup & Installation](#setup--installation)
- [Build & Serve](#build--serve)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture Overview

The application follows a **modular architecture** with clear separation of concerns:

```
                        +--------------------+
                        |    App Component   |
                        +--------------------+
                                  |
                 +----------------+----------------+
                 |                                 |
           Lazy-loaded Modules                Shared Module
   (Accounting, Admin, Dashboard,           +--------------------+
      Default, Login, etc.)                 |  Services          |
                                             |  Pipes             |
                                             |  Directives        |
                                             |  Models            |
                                             +--------------------+
                                  |
                             PrimeNG Styles
                       (UI components, themes, CSS)
```

**Key Points:**

- Each main feature is **lazy-loaded**.
- Modules contain **component-specific **``**, **``**, **``.
- Shared module provides **global services, pipes, directives, and models**.
- PrimeNG is used for **UI components, table/grid styling, dropdowns, buttons, dialogs**.

---

## Project Structure

```
src/
└── app/
    ├── accounting/           # Lazy-loaded accounting module
    │   ├── models/           # Component-specific models
    │   ├── services/         # Component-specific services
    │   └── voucher-approval/ # Feature components with their own model, modelSvc, dataSvc
    │   ├── accounting-module.ts
    │   └── accounting-routing-module.ts
    ├── admin/                # Lazy-loaded admin module
    ├── dashboard/            # Lazy-loaded dashboard module
    ├── default/              # Lazy-loaded default views
    ├── login/                # Lazy-loaded login/auth module
    └── shared/               # Shared module with common services, models, pipes, directives

Root files:
- app.config.ts      # Application configuration
- app.routes.ts      # Routing configuration
- main.ts / app.ts   # Bootstrap Angular application
- styles.css         # Global styles (PrimeNG themes included)
```

---

## Modules

Each lazy-loaded module contains **component-specific files**:

- `model.ts` → Component-specific data models
- `modelSvc.ts` → Component-specific business logic and operations
- `dataSvc.ts` → Component-specific HTTP API calls

This ensures each component's data, logic, and API handling is encapsulated and maintainable.

---

## Shared Module

Provides reusable functionalities across modules:

- **Services:** Global utilities, auth, state management
- **Models:** Shared TypeScript interfaces
- **Pipes:** Custom formatting & transformation
- **Directives:** DOM manipulation & validations

**Note:** Angular 19 recommends using `providedIn: 'root'` for services instead of importing the SharedModule in lazy-loaded modules.

---

## Services

- Component-specific services (`modelSvc`, `dataSvc`) handle local business logic & HTTP calls
- Shared services provide cross-module utilities (e.g., logging, notifications)

---

## Models

- Component-specific models encapsulate module data
- Shared models are used across modules

---

## Pipes & Directives

- **Custom Pipes** for formatting, filtering, transformations
- **Reusable Directives** for validations and DOM behavior

---

## Global State Management & Authentication

This application uses **NgRx** for **global state management** and a dedicated **Authsvc** service for authentication.

### NgRx Store Setup

- **Store provided in **``**:**

```ts
provideStore({ auth: authReducer })
```

- **State (**``**):**

```ts
export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  user: null,
  accessToken: null,
};
```

- **Actions (**``**):**

```ts
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>()
);

export const logout = createAction('[Auth] Logout');
```

- **Reducer (**``**):**

```ts
export const authReducer = createReducer(
  initialAuthState,
  on(loginSuccess, (state, { user, token }) => ({
    ...state,
    isLoggedIn: true,
    user,
    accessToken: token
  })),
  on(logout, () => ({
    isLoggedIn: false,
    user: null,
    accessToken: null
  }))
);
```

- **Selectors (**``**):**

```ts
export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectCurrentUser = createSelector(selectAuthState, state => state.user);
export const selectIsLoggedIn = createSelector(selectAuthState, state => state.isLoggedIn);
export const selectAccessToken = createSelector(selectAuthState, state => state.accessToken);
```

### Authsvc Service

Handles login, logout, and automatic logout based on JWT expiration.

```ts
@Injectable({ providedIn: 'root' })
export class Authsvc {
  private logoutTimer: any;

  constructor(private router: Router, private store: Store) {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('userInfo');
    if (token && user) {
      this.store.dispatch(loginSuccess({ user: JSON.parse(user), token }));
      this.startAutoLogoutWatcher();
    }
  }

  login(user: any, token: string) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('userInfo', JSON.stringify(user));
    this.store.dispatch(loginSuccess({ user, token }));
    this.startAutoLogoutWatcher();
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userInfo');
    this.store.dispatch(logout());
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    this.router.navigate(['/login']);
  }

  startAutoLogoutWatcher() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const expiry = this.getTokenExpirationDate(token);
    if (!expiry) return;

    const timeout = expiry.getTime() - new Date().getTime();
    if (this.logoutTimer) clearTimeout(this.logoutTimer);

    this.logoutTimer = setTimeout(() => this.logout(), timeout);
  }

  getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      if (!decoded.exp) return null;
      const date = new Date(0);
      date.setUTCSeconds(decoded.exp);
      return date;
    } catch {
      return null;
    }
  }
}
```

### Usage Example

```ts
loggedUser$: Observable<any | null>;
constructor(private store: Store, private modelSvc: ModelService) {
  this.loggedUser$ = this.store.select(selectCurrentUser);
  this.loggedUser$.subscribe(user => {
    if (user) this.modelSvc.loggedBy = user.userName;
  });
}
```

This setup ensures **centralized authentication state**, **auto-logout**, and **reactive user info distribution** across components.

---

## Setup & Installation

```bash
git clone https://github.com/Tutul33/SonaliERPext.git
cd SONALIERPEXT
npm install
```

---

## Build & Serve

**Development Mode:**

```bash
ng serve
```

**Production Build:**

```bash
ng build --prod
```

---

## Contributing

- Create a feature branch
- Follow Angular best practices
- Submit a pull request for review

---