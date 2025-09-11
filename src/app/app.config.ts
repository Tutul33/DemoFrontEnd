import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { jwtInterceptor } from './shared/services/auth.interceptor';
import { errorInterceptor } from './shared/services/error.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';

// NgRx imports
import { provideStore } from '@ngrx/store';
import { authReducer } from './shared/store/auth.reducer';

import "../app/shared/models/extensions";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      routes,
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor])
    ),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    ConfirmationService,
    MessageService,

    //NgRx setup
    provideStore({ auth: authReducer })
  ]
};
