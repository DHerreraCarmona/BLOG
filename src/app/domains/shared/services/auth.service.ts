import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { environment } from '@env/enviroments.prod';

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiUrl = environment.API_URL;
  private _authenticated = false;

  constructor(private http: HttpClient) {}

  getCsrfToken(): string | null {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : null;
  }

  fetchCsrf(): Observable<any> {
    return this.http.get(`${this.apiUrl}csrf/`, { withCredentials: true });
  }

  checkAuth(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}me/`, { withCredentials: true }).pipe(
      tap(() => this._authenticated = true),
      map(() => true),
      catchError(() => {
        this._authenticated = false;
        return of(false);
      })
    );
  }

  get isAuthenticated(): boolean {
    return this._authenticated;
  }

  login(username: string, password: string): Observable<any> {
    const csrfToken = this.getCsrfToken(); 
  
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);
  
    return this.http.post(`${this.apiUrl}login/`, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken ?? ''  
      },
      withCredentials: true  
    }).pipe(
      tap(() => {
        this._authenticated = true;
        console.log('Login successful');
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        this._authenticated = false;
        return of(null);
      })
    );
  }  

  register(email: string, password: string): Observable<any> {
    const csrfToken = this.getCsrfToken(); 
    
    const body = new URLSearchParams();
    body.set('email', email);
    body.set('username', email.substring(0, email.indexOf('@')));
    body.set('password', password);
    body.set('group', 'default');
    
    return this.http.post(`${this.apiUrl}register/`, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken ?? ''},
        withCredentials: true  
      })
      .pipe(
        tap(() => {
        this._authenticated = true;
        console.log('Register successful');
      }),
      catchError((error) => {
        console.error('Register failed:', error);
        this._authenticated = false;
        return of(null);
      })
    );
  }  

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}logout/`, {}, { withCredentials: true }).pipe(
      tap(() => this._authenticated = false)
    );
  }
}
