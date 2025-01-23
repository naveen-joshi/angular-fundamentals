import { ApplicationConfig, ErrorHandler, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { loggingInterceptor } from './core/interceptors/logging.interceptor';
import { GlobalErrorHandler } from './core/error-handling/global-error.handler';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { fieldConfigReducer } from './store/field-config/field-config.reducer';
import { FieldConfigEffects } from './store/field-config/field-config.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([loggingInterceptor])
    ),
    { 
      provide: ErrorHandler, 
      useClass: GlobalErrorHandler 
    },
    provideClientHydration(withEventReplay()),
    provideStore({
      fieldConfig: fieldConfigReducer
    }),
    provideEffects([FieldConfigEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    })
  ]
};
