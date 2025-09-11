// shared/store/auth.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './auth.state';
import { loginSuccess, logout } from './auth.actions';

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
