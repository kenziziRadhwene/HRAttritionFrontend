import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

interface NotificationItem {
  id: number;
  type: string;
  message: string;
  valeur?: string;
  lue: boolean;
  dateCreation: string;
}

@Component({
  selector: 'app-notification-panneau',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, DatePipe],
  templateUrl: './notification-panneau.component.html',
  styleUrls: ['./notification-panneau.component.scss']
})
export class NotificationPanneauComponent implements OnInit {

  ouvert        = false;
  notifications: NotificationItem[] = [];
  nbNonLues     = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chargerCount();
  }

  chargerCount(): void {
    this.http.get<{nonLues: number}>('http://localhost:8080/api/notifications/count')
      .subscribe({ next: (res) => { this.nbNonLues = res.nonLues; } });
  }

  toggle(): void {
    if (!this.ouvert) {
      this.ouvert = true;
      this.chargerNotifications();
    } else {
      this.ouvert = false;
    }
  }

  chargerNotifications(): void {
    this.http.get<NotificationItem[]>('http://localhost:8080/api/notifications')
      .subscribe({
        next: (data: NotificationItem[]) => {
          this.notifications = data;
          // Marquer comme lues après ouverture
          if (this.nbNonLues > 0) {
            this.http.put('http://localhost:8080/api/notifications/marquer-lues', {})
              .subscribe({ next: () => { this.nbNonLues = 0; } });
          }
        }
      });
  }

  @HostListener('document:keydown.escape')
  fermer(): void {
    this.ouvert = false;
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      recalcul: 'sync',
      critique: 'warning',
      rapport:  'description',
      planifie: 'calendar_today'
    };
    return icons[type] ?? 'notifications';
  }
}
