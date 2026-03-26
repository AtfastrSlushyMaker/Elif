import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe(
      notifications => {
        this.notifications = notifications;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  }

  getNotificationClasses(type: string): string {
    const baseClasses = 'flex items-center p-4 mb-4 text-sm border rounded-lg';

    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-200 text-green-700`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-200 text-red-700`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-700`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-50 border-blue-200 text-blue-700`;
    }
  }
}