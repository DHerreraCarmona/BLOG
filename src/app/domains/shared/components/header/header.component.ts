import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '@shared/services/auth.service';
import { combineLatest, Subscription, tap } from 'rxjs';

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

  constructor(
    private authService: AuthService,
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

  logout(){
    this.authService.logout().subscribe();
    this.isAuth = false;
    this.username = "";
  }

  ngOnDestroy(): void { 
      if (this.authSubscription) {
        this.authSubscription.unsubscribe();
      }
  }
}
