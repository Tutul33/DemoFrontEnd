import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { loginSuccess, logout } from "../store/auth.actions";
import { SignalRService } from "./signalr-service";

@Injectable({
  providedIn: 'root'
})
export class Authsvc {
  private logoutTimer: any;

  constructor(private router: Router, private store: Store,private signalR:SignalRService) {
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
    this.signalR.stopConnection();
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

  //  Add these for the guard
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
  get isLoggedInValue(): boolean { 
    const token = localStorage.getItem('access_token');
    return !!token && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return true;

    const expiry = this.getTokenExpirationDate(token);
    if (!expiry) return true;

    return new Date() > expiry;
  }
}
