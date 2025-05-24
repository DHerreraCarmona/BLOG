import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationComponent } from "./domains/shared/notifications/notifications.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OverlayModule, MatSnackBarModule, NotificationComponent],
  template: `<router-outlet></router-outlet> <app-notification />`,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'BLOG';
}
