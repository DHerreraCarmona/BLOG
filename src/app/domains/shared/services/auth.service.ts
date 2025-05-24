import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { BehaviorSubject, firstValueFrom, Observable, of,throwError,} from 'rxjs';

import { AuthorPost } from '@shared/models/author';
import { environment } from '@env/enviroments.prod';

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiUrl = environment.API_URL;

  private authStatusSubject = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatusSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<AuthorPost | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isInitializing = true;

  constructor(private http: HttpClient) {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.authStatusSubject.next(true);
      } catch (error) {
        console.error('Error parsing currentUser from localStorage:', error);
        this.clearAuthData();
      } finally {
        this.isInitializing = false;
      }
    } else {
      this.isInitializing = false;
    }
  }

  register(email: string, password: string): Observable<any> {
    const csrfToken = this.getCsrfToken();

    const body = new URLSearchParams();
    body.set('email', email);
    body.set('username', email.substring(0, email.indexOf('@')));
    body.set('password', password);
    body.set('group', 'None');

    return this.http
      .post(`${this.apiUrl}register/`, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken ?? '',
        },
      })
      .pipe(
        tap(() => {
          console.log('Register successful');
        }),
        catchError((error) => {
          console.error('Register failed:', error);
          return throwError(() => error);
        })
      );
  }

  login(username: string, password: string): Observable<AuthorPost | null> {
    const csrfToken = this.getCsrfToken();
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    return this.http
      .post(`${this.apiUrl}login/`, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken ?? '',
        },
      })
      .pipe(
        tap((user: any) => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.authStatusSubject.next(true);
          console.log('Login successful');
        }),
        catchError((error) => {
          console.error('Login failed:', error);
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}logout/`, {}).pipe(
      tap(() => {
        this.clearAuthData();
      }),
      catchError((error) => {
        // this.clearAuthData();
        // return of(null);
        return throwError(() => error);
      })
    );
  }

  get isAuthenticated(): boolean {
    return this.authStatusSubject.getValue();
  }

  get user(): AuthorPost | null {
    return this.currentUserSubject.getValue();
  }

  getUser(): AuthorPost {
    try {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        return JSON.parse(userJson);
      }
    } catch (error) {
      console.error('Error parsing currentUser from localStorage:', error);
      this.clearAuthData();
    }
    return { id: -1, username: '', team: '' };
  }

  getUserApi(): Observable<AuthorPost> {
    return this.http.get<AuthorPost>(`${this.apiUrl}me/`).pipe(
      tap((user) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.authStatusSubject.next(true);
      })
    );
  }

  checkAuth(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}me/`, { withCredentials: true }).pipe(
      map((user: any) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.authStatusSubject.next(true);
        return true;
      }),
      catchError(() => {
        this.clearAuthData();
        return of(false);
      })
    );
  }

  private getCsrfToken(): string | null {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : null;
  }

  fetchCsrf(): Observable<any> {
    return this.http.get(`${this.apiUrl}csrf/`, { withCredentials: true });
  }

  private clearAuthData(): void {
    this.isInitializing = false;
    this.currentUserSubject.next(null);
    this.authStatusSubject.next(false);
    localStorage.removeItem('currentUser');
    document.cookie = `csrftoken=; expires=${new Date(0).toUTCString()}; path=/;`;
    document.cookie = `sessionid=; expires=${new Date(0).toUTCString()}; path=/;`;
  }
}
