import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './notifications.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notificationService.notification$ | async as notif"
         class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999]
                px-6 py-3 rounded-2xl shadow-lg text-center text-white
                max-w-[90vw] transition-all duration-300 ease-in-out"
         [ngClass]="notif.type === 'success' ? 'bg-green-600' : 'bg-red-600'">
      <p class="text-md font-semibold">{{ notif.message }}</p>
    </div>
  `,
})
export class NotificationComponent {
  constructor(public notificationService: NotificationService) {}
}
