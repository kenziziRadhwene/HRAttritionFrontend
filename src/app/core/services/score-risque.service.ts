import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScoreRisque } from '../../shared/models/score-risque.model';

@Injectable({ providedIn: 'root' })
export class ScoreRisqueService {

  private apiUrl = `${environment.apiUrl}/scores`;

  constructor(private http: HttpClient) {}

  getRecommandations(): Observable<ScoreRisque[]> {
    return this.http.get<ScoreRisque[]>(`${this.apiUrl}/recommandations`);
  }

  getHistorique(employeeId: number): Observable<ScoreRisque[]> {
    return this.http.get<ScoreRisque[]>(`${this.apiUrl}/employee/${employeeId}`);
  }
}
