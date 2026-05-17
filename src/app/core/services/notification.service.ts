import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationPanneau } from '../../shared/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private url = 'http://localhost:8080/api/notifications/panneau';

  constructor(private http: HttpClient) {}

  getPanneau(): Observable<NotificationPanneau> {
    return this.http.get<NotificationPanneau>(this.url);
  }
}
