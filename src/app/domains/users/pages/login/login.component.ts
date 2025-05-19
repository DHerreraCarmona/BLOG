import {CommonModule} from '@angular/common'
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router,RouterLink, RouterOutlet} from '@angular/router';
import { FormBuilder,FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '@shared/services/auth.service';
import { BtnComponent } from '@shared/components/btn/btn.component';
import { environment } from "@env/enviroments.prod";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [BtnComponent, ReactiveFormsModule, FormsModule,CommonModule,RouterLink], 
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit{
  
  apiUrl = environment.API_URL;

  form;
  email: string = '';
  password: string = '';
  showPassword = false;
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
    });
  }

  ngOnInit(): void {
    this.http.get(`${this.apiUrl}csrf/`, {
      withCredentials: true
    }).subscribe(() => {});
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status = 'loading';
    const { email, password } = this.form.getRawValue();
    this.authService.login(email, password).subscribe({
      next: () => {
        this.authService.checkAuth().subscribe({            
          next:(auth) => {
            if (auth) {
              this.status = 'success';
              this.router.navigate(['/posts']);
            } else {
                this.handleAuthError();
            }
          },
          error: (err) => {
            this.handleAuthError();
          } 
        });
      },
      error: (err) => {
        this.handleAuthError();
      } 
    });
  }
  
  private handleAuthError(): void {
    this.status = 'error';
    this.form.setErrors({ invalidLogin: true });
    this.form.get('password')?.reset();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  resetForm(): void {
    this.form.reset();
    this.status = 'init';
  }
}
