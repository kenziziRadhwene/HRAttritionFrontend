// src/app/core/services/audit-log.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLogPage } from '../../shared/models/audit-log.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuditLogService {

  private readonly API = `${environment.apiUrl}/admin/audit-logs`;

  constructor(private http: HttpClient) {}

  getLogs(
    page     = 0,
    size     = 20,
    search   = '',
    role     = '',
    action   = ''
  ): Observable<AuditLogPage> {
    let params = new HttpParams()
      .set('page',   page)
      .set('size',   size)
      .set('search', search)
      .set('role',   role)
      .set('action', action);

    return this.http.get<AuditLogPage>(this.API, { params });
  }

  exportCsv(): Observable<Blob> {
    return this.http.get(`${this.API}/export`, { responseType: 'blob' });
  }
}
