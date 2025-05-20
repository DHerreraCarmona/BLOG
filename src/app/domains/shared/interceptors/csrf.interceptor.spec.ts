import { TestBed } from '@angular/core/testing';
import { CsrfInterceptor } from './csrf.interceptor';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController,} from '@angular/common/http/testing';

describe('CsrfInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrftoken=test-csrf-token',
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: CsrfInterceptor,
          multi: true,
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should add X-CSRFToken header to POST request', () => {
    http.post('/test-endpoint', {}).subscribe();

    const req = httpMock.expectOne('/test-endpoint');
    expect(req.request.withCredentials).toBeTrue();
    expect(req.request.headers.get('X-CSRFToken')).toBe('test-csrf-token');
  });

  it('should not add X-CSRFToken to GET request', () => {
    http.get('/test-endpoint').subscribe();

    const req = httpMock.expectOne('/test-endpoint');
    expect(req.request.withCredentials).toBeTrue();
    expect(req.request.headers.has('X-CSRFToken')).toBeFalse();
  });

  afterEach(() => {
    httpMock.verify();
  });
});
