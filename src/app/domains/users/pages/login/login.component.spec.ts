import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LoginComponent } from './login.component';
import { AuthService } from '@shared/services/auth.service';
import { NotificationService } from '@shared/notifications/notifications.service';

const mockUser = { id: 1, username: 'test', team: 'None' };

describe('LoginComponent', () => {
  let router: Router;
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login', 'checkAuth', 'fetchCsrf'
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['show']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a login form with required fields', () => {
    const form = component.form;
    expect(form.contains('email')).toBeTrue();
    expect(form.contains('password')).toBeTrue();
  });

  it('should invalidate the form if fields are empty or invalid', () => {
    component.form.setValue({ email: '', password: '' });
    expect(component.form.valid).toBeFalse();
  });

  it('should show error if email is not valid', () => {
    component.form.setValue({ email: 'invalidemail', password: 'password123' });
    component.onSubmit();
    expect(component.form.valid).toBeFalse();
  });

  it('should call fetchCsrf, then login and navigate on success', () => {
    const formData = { email: 'test@example.com', password: 'securePassword123' };
    component.form.setValue(formData);

    authServiceSpy.fetchCsrf.and.returnValue(of({}));
    authServiceSpy.login.and.returnValue(of(mockUser));
    authServiceSpy.checkAuth.and.returnValue(of(true));

    component.onSubmit();

    expect(authServiceSpy.fetchCsrf).toHaveBeenCalled();
    expect(authServiceSpy.login).toHaveBeenCalledWith(formData.email, formData.password);
    expect(router.navigate).toHaveBeenCalledWith(['/posts']);
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Logged in successfully!', 'success');
  });

  it('should handle login error and show error message', () => {
    component.form.setValue({
      email: 'fail@example.com',
      password: 'wrongpassword',
    });

    authServiceSpy.fetchCsrf.and.returnValue(of({}));
    authServiceSpy.login.and.returnValue(
      throwError(() => new Error('Login failed'))
    );

    component.onSubmit();

    expect(component.status).toBe('error');
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Login failed. Please check your credentials.', 'error');
  });
});
