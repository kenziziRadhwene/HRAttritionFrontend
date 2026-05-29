// src/app/core/services/admin-dashboard.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminDashboardStats } from '../../shared/models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {

  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(this.apiUrl);
  }
}
