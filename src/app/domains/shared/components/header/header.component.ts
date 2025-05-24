import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '@shared/services/auth.service';
import { combineLatest, Subscription, tap } from 'rxjs';
import { NotificationService } from '@shared/notifications/notifications.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
  
})
export class HeaderComponent implements OnInit, OnDestroy{
  isAuth = false;
  username = "";
  private authSubscription?: Subscription; 
  logOutStatus: 'init' | 'loading' | 'success' | 'error' = 'init';


  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
  ){}

  ngOnInit(): void {
    this.authSubscription = combineLatest([
        this.authService.authStatus$,
        this.authService.currentUser$
    ]).pipe(
        tap(([isAuth, user]) => {
            this.isAuth = isAuth;
            this.username = user ? user.username : "";
        })
    ).subscribe();
  }

  logout() {
    this.logOutStatus = 'loading';
    this.authService.logout().subscribe({
      next: () => {
        this.isAuth = false;
        this.username = '';
        this.logOutStatus = 'success';
        this.notificationService.show('You have logged out successfully.', 'success');
      },
      error: (err) => {
        this.logOutStatus = 'error';
        this.notificationService.show('Logout failed. Please try again.', 'error');
      }
    });
  }

  ngOnDestroy(): void { 
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
