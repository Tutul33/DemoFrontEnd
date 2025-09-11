//shared/store/auth.state.ts
import { User } from '../models/user.model';

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
