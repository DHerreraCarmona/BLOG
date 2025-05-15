import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import {AbstractControl } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { AuthService } from '@shared/services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the register component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a registration form with required fields', () => {
    const form = component.form;
    expect(form.contains('email')).toBeTrue();
    expect(form.contains('password')).toBeTrue();
    expect(form.contains('confirmPassword')).toBeTrue();
  });

  it('should invalidate the form if fields are empty or invalid', () => {
    component.form.setValue({
      email: '',
      password: '',
      confirmPassword: ''
    });

    expect(component.form.invalid).toBeTrue();
  });

  it('should call AuthService.register with valid data and navigate to login', () => {
    const formData = {
      email: 'test@example.com',
      password: 'abc12345',
      confirmPassword: 'abc12345'
    };

    component.form.setValue(formData);
    authServiceSpy.register.and.returnValue(of({ success: true }));

    spyOn(router, 'navigate');

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith(formData.email, formData.password);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { registered: true } });
  });
  
  it('should show error if passwords do not match', () => {
    component.form.setValue({
      email: 'user@example.com',
      password: 'password1',
      confirmPassword: 'password2'
    });
    component.onSubmit();
      expect(component.form.valid).toBeFalse();
  });

  it('should show error if email is not valid', () => {
    component.form.setValue({
      email: 'userexample.com',
      password: 'password1',
      confirmPassword: 'password2'
    });
    component.onSubmit();
      expect(component.form.valid).toBeFalse();
  });

  // it('should handle registration error from API', () => {
  //   component.registerForm.setValue({
  //     username: 'fail@example.com',
  //     password: 'password123',
  //     confirmPassword: 'password123'
  //   });
  
  //   authServiceSpy.register.and.returnValue(
  //     throwError(() => ({ status: 400, error: { message: 'Email already exists' } }))
  //   );
  
  //   component.onSubmit();
  
  //   expect(component.errorMessage).toBe('Email already exists');
  // });

});


  

