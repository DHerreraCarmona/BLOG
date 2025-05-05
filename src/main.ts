import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CsrfInterceptor } from '@shared/interceptors/csrf.interceptor';

import { routes } from './app/app.routes'; 

bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(withInterceptorsFromDi()),
      {
        provide: HTTP_INTERCEPTORS,
        useClass: CsrfInterceptor,
        multi: true
      }
    ]
  })
  .catch((err) => console.error(err));
