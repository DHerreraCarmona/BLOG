import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  FormBuilder, FormsModule, Validators,
  ReactiveFormsModule, AbstractControl,
} from '@angular/forms';

import { environment } from '@env/enviroments.prod';
import { AuthService } from '@shared/services/auth.service';
import { NotificationService } from '@shared/notifications/notifications.service';
@Component({
  selector: 'app-register',
  imports: [ CommonModule, FormsModule,
    ReactiveFormsModule, RouterLink,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  apiUrl = environment.API_URL;

  form;
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword = false;
  status: 'init' | 'loading' | 'success' | 'error' = 'init';

  constructor(
    private router: Router,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.form = this.formBuilder.nonNullable.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {
    this.http
      .get(`${this.apiUrl}csrf/`, {
        withCredentials: true,
      })
      .subscribe(() => {});
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status = 'loading';
    const { email, password } = this.form.getRawValue();
    this.authService.register(email, password).subscribe({
      next: () => {
        this.status = 'success';
              this.notificationService.show('User registered successfully', 'success');

        this.router.navigate(['/login'], { queryParams: { registered: true } });
      },
      error: (err) => {
        this.handleAuthError();
      },
    });
  }

  private handleAuthError(): void {
    this.status = 'error';
    this.form.get('password')?.reset();
    this.form.get('confirmPassword')?.reset();
    this.form.setErrors({ unauthenticated: true });
    this.notificationService.show('Register failed. Please try again', 'error');
  }

  passwordMatchValidator(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  resetForm(): void {
    this.form.reset();
    this.status = 'init';
  }
}
