import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  notification$ = this.notificationSubject.asObservable();

  show(message: string, type: 'success' | 'error' = 'success', duration = 3000) {
    this.notificationSubject.next({ message, type });
    timer(duration).subscribe(() => this.notificationSubject.next(null));
  }
}
