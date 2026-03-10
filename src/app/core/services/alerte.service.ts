import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alerte } from '../../shared/models/alerte.model';

@Injectable({ providedIn: 'root' })
export class AlerteService {

  private apiUrl = `${environment.apiUrl}/alertes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(this.apiUrl);
  }

  getNonLues(): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(`${this.apiUrl}/non-lues`);
  }

  marquerLue(id: number): Observable<Alerte> {
    return this.http.put<Alerte>(`${this.apiUrl}/${id}/lue`, {});
  }

  marquerTraitee(id: number): Observable<Alerte> {
    return this.http.put<Alerte>(`${this.apiUrl}/${id}/traitee`, {});
  }
}
