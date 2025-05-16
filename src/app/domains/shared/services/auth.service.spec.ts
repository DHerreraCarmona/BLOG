import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/enviroments.prod';

import { fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';


describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockData = {
    id: 1,
    email: 'test@example.com',
    username: 'test',
    password: 'securePassword123',
    confirmPassword: 'securePassword123'
  };

  const mockUser = {
    id: 1,
    username: 'test',
    team: 'None'
  };

  // spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockData));
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(console, 'log').and.callThrough();
    spyOn(console, 'error').and.callThrough();
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');
  });

  // afterEach(() => {
  //   httpMock.verify();
  // });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a new user and go to login', (done) => {
    
    service.register(mockData.email, mockData.password).subscribe(response => {
      expect(response).toEqual({ success: true });
      expect(console.log).toHaveBeenCalledWith('Register successful');
      done();
    });
  
    const req = httpMock.expectOne(`${environment.API_URL}register/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
  
    const body = new URLSearchParams(req.request.body);
    expect(body.get('email')).toBe('test@example.com');
    expect(body.get('username')).toBe('test');
    expect(body.get('password')).toBe('securePassword123');
    expect(body.get('group')).toBe('None');

    expect(service.isAuthenticated).toBeFalsy();
    
    
    req.flush({ success: true });
  });
  

  it('should handle registration error', (done) => {

    service.register(mockData.email,'123').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(400);
        expect(error.error).toEqual({ message: 'Invalid input' });
        expect(console.error).toHaveBeenCalledWith('Register failed:',error);
        done();
      }
    });

    const req = httpMock.expectOne(`${environment.API_URL}register/`);
    req.flush({ message: 'Invalid input' }, { status: 400, statusText: 'Bad Request' });
  });


  it('should login a user', fakeAsync(() => {
    let response: any;

    service.login('test', 'securePassword123').subscribe(res => {
      response = res;
    });

    const req = httpMock.expectOne(`${environment.API_URL}login/`);
    req.flush(mockUser); 

    flushMicrotasks(); 

    expect(response).toEqual(mockUser);
    expect(service.isAuthenticated).toBeTrue();
    expect(console.log).toHaveBeenCalledWith('Login successful');
    expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', JSON.stringify(mockUser));
  }));

  it('should handle login error', fakeAsync(() => {
    let response: any;
    let errorResponse: any;

    service.login('test', 'wrongPass123').subscribe({
      next: res => {
        response = res;
      },
      error: err => {
        errorResponse = err;
      }
    });

    const req = httpMock.expectOne(`${environment.API_URL}login/`);
    req.flush(
      { message: 'Invalid credentials' }, 
      { status: 401, statusText: 'Unauthorized' }
    );

    flushMicrotasks();

    expect(response).toBeUndefined();
    expect(errorResponse.status).toBe(401);
    expect(service.isAuthenticated).toBeFalse();
    expect(console.error).toHaveBeenCalledWith('Login failed:', jasmine.anything());
    expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
  }));



});
