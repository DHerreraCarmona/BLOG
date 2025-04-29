import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const csrfToken = getCookie('csrftoken');

    if (csrfToken && !req.method.match(/GET|HEAD/)) {
      const cloned = req.clone({
        withCredentials: true,
        headers: req.headers.set('X-CSRFToken', csrfToken)
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}

