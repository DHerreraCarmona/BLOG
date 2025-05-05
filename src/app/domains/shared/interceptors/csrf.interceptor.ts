import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { Observable } from 'rxjs';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const csrfToken = getCookie('csrftoken');
    
    let cloned = req.clone({ withCredentials: true });

    if (csrfToken && !req.method.match(/GET|HEAD/)) {
      cloned = cloned.clone({
        headers: cloned.headers.set('X-CSRFToken', csrfToken)
      });
    }

    return next.handle(cloned);
  }
}

