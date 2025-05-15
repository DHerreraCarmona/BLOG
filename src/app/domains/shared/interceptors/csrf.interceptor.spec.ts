import { TestBed } from '@angular/core/testing';
import { HttpHandler, HttpInterceptorFn } from '@angular/common/http';

import { CsrfInterceptor } from './csrf.interceptor';

describe('csrfInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => {
      const handler: HttpHandler = { handle: next };
      return new CsrfInterceptor().intercept(req, handler);
    });

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});