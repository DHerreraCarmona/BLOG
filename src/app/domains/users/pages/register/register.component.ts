import {CommonModule} from '@angular/common'
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router,RouterLink, RouterOutlet} from '@angular/router';
import { FormBuilder,FormsModule, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';

import { AuthService } from '@shared/services/auth.service';
import { BtnComponent } from '@shared/components/btn/btn.component';
import { environment } from "@env/enviroments.prod";
@Component({
  selector: 'app-register',
  imports: [BtnComponent, CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {

  apiUrl = environment.API_URL;
  
  form;
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword = false;
  showConfirm = false;
  status: 'init' | 'loading' | 'success' | 'error' = 'init';

  constructor(
    private formBuilder: FormBuilder,  
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.form = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
      }, {
        validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.http.get(`${this.apiUrl}csrf/`, {
      withCredentials: true
    }).subscribe(() => {});
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  passwordMatchValidator(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  resetForm(): void {
    this.form.reset();
    this.status = 'init';
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
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.handleAuthError();
      }
    });
  }

  private handleAuthError(): void {
    this.status = 'error';
    this.form.setErrors({ unauthenticated: true });
    this.form.get('password')?.reset();
    this.form.get('confirmPassword')?.reset();
  }
  
}
