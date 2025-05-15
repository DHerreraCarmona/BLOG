import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/enviroments.prod';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    spyOn(console, 'error');
    spyOn(console, 'log');
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a new user and go to login', () => {
    const mockData = {
      email: 'test@example.com',
      password: 'securePassword123',
      confirmPassword: 'securePassword123'
    };
  
    service.register(mockData.email,mockData.password).subscribe(response => {
      expect(response).toEqual({ success: true });
    });
  
    const req = httpMock.expectOne(`${environment.API_URL}register/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
  
    const body = new URLSearchParams(req.request.body);
    expect(body.get('email')).toBe('test@example.com');
    expect(body.get('username')).toBe('test');
    expect(body.get('password')).toBe('securePassword123');
    expect(body.get('group')).toBe('None');
  
    req.flush({ success: true });
  });
  

  it('should handle registration error', () => {
    const mockData = {
      username: 'fail@example.com',
      password: '123',
      confirmPassword: '123'
    };

    service.register(mockData.username,mockData.password ).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.error).toEqual({ message: 'Invalid input' });
      }
    });

    const req = httpMock.expectOne(`${environment.API_URL}register/`);
    req.flush({ message: 'Invalid input' }, { status: 400, statusText: 'Bad Request' });
  });
});
