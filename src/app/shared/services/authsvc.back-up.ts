import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthsvcBackUp {
  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  private logoutTimer: any;
  constructor(private router: Router) {
     const stored = localStorage.getItem('isLoggedIn');
     this.isLoggedInSubject.next(stored === 'true');
  }

  // Call this on login success
  login() {
     localStorage.setItem('isLoggedIn', 'true');
    this.isLoggedInSubject.next(true);
  }

  // Call this on logout
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  // Optional getter for current value
  get isLoggedInValue(): boolean {
    return this.isLoggedInSubject.value;
  }

  //Token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    const expiry = this.getTokenExpirationDate(token);
    if (!expiry) return true;

    return expiry.getTime() < new Date().getTime();
  }

  getTokenExpirationDate(token: string): Date | null {
    const decoded: any = JSON.parse(atob(token.split('.')[1]));
    if (!decoded.exp) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  startAutoLogoutWatcher() {
    const token = this.getToken();
    if (!token) return;

    const expiry = this.getTokenExpirationDate(token);
    if (!expiry) return;

    const timeout = expiry.getTime() - new Date().getTime();

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, timeout);
  }
  
  getLoggedUserInfo(){
    try {
       const userInfo=localStorage.getItem('userInfo');
       return JSON.parse(userInfo);
    } catch (error) {
      
    }
  }
}
