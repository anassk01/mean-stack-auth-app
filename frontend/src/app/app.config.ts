import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { tokenInterceptor } from './core/http/interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes, 
      withViewTransitions(), 
      withComponentInputBinding()
    ),
    provideHttpClient(
      withInterceptors([tokenInterceptor])
    ),
    provideAnimations()
    // NgRx removed since it's not currently being used
  ]
};