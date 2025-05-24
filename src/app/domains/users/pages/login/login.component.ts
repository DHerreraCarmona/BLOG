import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  FormBuilder, FormsModule, Validators, ReactiveFormsModule
} from '@angular/forms';

import { environment } from '@env/enviroments.prod';
import { AuthService } from '@shared/services/auth.service';
import {NotificationService} from '@shared/notifications/notifications.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule,
    CommonModule, RouterLink,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  form;
  email: string = '';
  password: string = '';
  showPassword = false;
  apiUrl = environment.API_URL;
  status: 'init' | 'loading' | 'success' | 'error' = 'init';

  constructor(
    private router: Router,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.form = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
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

    this.authService.fetchCsrf().pipe(
      switchMap(() => this.authService.login(email, password))
    ).subscribe({
      next: () => {
        this.authService.checkAuth().subscribe({
          next: (auth) => {
            if (auth) {
              this.status = 'success';
              this.router.navigate(['/posts']);
                this.notificationService.show('Logged in successfully!', 'success');
            } else {
              this.handleAuthError();
            }
          },
          error: () => this.handleAuthError()
        });
      },
      error: () => this.handleAuthError()
    });
  }

  private handleAuthError(): void {
    this.status = 'error';
    this.form.setErrors({ invalidLogin: true });
    this.form.get('password')?.reset();
    this.notificationService.show('Login failed. Please check your credentials.', 'error');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  resetForm(): void {
    this.form.reset();
    this.status = 'init';
  }
}
