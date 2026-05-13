import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats, EvolutionMensuelle } from '../../shared/models/dashboard.model';


@Injectable({ providedIn: 'root' })
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getStatsFiltered(departement?: string, niveauRisque?: string): Observable<DashboardStats> {
    let params = '';
    if (departement) params += `?departement=${departement}`;
    if (niveauRisque) params += `${params ? '&' : '?'}niveauRisque=${niveauRisque}`;
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/filtered${params}`);
  }

  getEvolutionMensuelle(): Observable<EvolutionMensuelle[]> {
    return this.http.get<EvolutionMensuelle[]>(`${environment.apiUrl}/scores/evolution-mensuelle`);
  }
}
