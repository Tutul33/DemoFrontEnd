// shared/store/auth.actions.ts
import { createAction, props } from '@ngrx/store';
import { User } from '../models/user.model';

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>()
);

export const logout = createAction('[Auth] Logout');
