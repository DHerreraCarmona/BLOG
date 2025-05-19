import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '@shared/services/auth.service';

const mockData = {
  email: 'test@example.com',
  password: 'securePassword123',
  confirmPassword: 'securePassword123'
};

const mockUser = {
  id: 1,
  username: 'test',
  team: 'None'
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login','checkAuth']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
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
    component.form.setValue({email: '',password: '',});
    expect(component.form.valid).toBeFalse();
  });

  it('should show error if email is not valid', () => {
    component.form.setValue({
      email: 'userexample.com',
      password: 'password1',
    });
    component.onSubmit();
    expect(component.form.valid).toBeFalse();
  });

  it('should call AuthService.login with valid data and navigate to /posts', () => {
    const formData = {
      email: 'test@example.com',
      password: 'securePassword123',
    };
    
    component.form.setValue(formData);
    authServiceSpy.login.and.returnValue(of(mockUser));
    authServiceSpy.checkAuth.and.returnValue(of(true));

    expect(component.status).toBe('init');
   
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith(formData.email, formData.password);
    expect(router.navigate).toHaveBeenCalledWith(['/posts']);
    expect(component.status).toBe('success');
  });

  it('should handle login error and set status to error', () => {
    component.form.setValue({email:'wronemaiil@mail.com', password:'wrongpassword'});

    authServiceSpy.login.and.returnValue(
      throwError(()=> {return {error: 'Login failed'}})
    );

    component.onSubmit();

    expect(component.status).toBe('error');
    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(authServiceSpy.isAuthenticated).toBeFalsy();
    expect(authServiceSpy.user).toBeUndefined();
    // expect(component.errorMessage).toBe('Email already exists');
  });
});
