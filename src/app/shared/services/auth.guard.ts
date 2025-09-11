// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authsvc } from './authsvc'; // adjust path

export const authGuard: CanActivateFn = () => {
  const auth = inject(Authsvc);
  const router = inject(Router);

  if (auth.isLoggedInValue && !auth.isTokenExpired()) {
    return true;
  } else {
    auth.logout(); 
    router.navigate(['/login']);
    return false;
  }
};

