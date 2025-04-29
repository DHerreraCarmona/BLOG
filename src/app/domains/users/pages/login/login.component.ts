import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder,FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '@shared/services/auth.service';
import { BtnComponent } from '@shared/components/btn/btn.component';
import { environment } from "@env/enviroments.prod";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [BtnComponent, ReactiveFormsModule, FormsModule], 
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
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();

      this.authService.login(email, password).subscribe({
        next: () => {
          this.status = 'success';
          this.authService.checkAuth().subscribe(auth => {
            if (auth) {
              this.http.get('http://localhost:8000/api/post/')
                .subscribe(response => {
                  console.log(response);
                });
            } else {
              this.router.navigate(['/login']);
            }
          });
        },
        error: (err) => {
          console.error('Login fallido:', err);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
  
}
