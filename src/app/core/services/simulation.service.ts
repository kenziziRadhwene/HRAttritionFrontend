import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SimulationResponse,
  ComparaisonSimulation
} from '../../shared/models/simulation.model';

@Injectable({ providedIn: 'root' })
export class SimulationService {

  private apiUrl = `${environment.apiUrl}/simulations`;

  constructor(private http: HttpClient) {}

  simulerSalaire(employeeId: number, pourcentage: number): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${this.apiUrl}/salaire`, {
      employeeId,
      pourcentageAugmentation: pourcentage
    });
  }

  simulerPoste(employeeId: number, nouveauPoste: string,
               nouveauDepartement: string, nouveauJobLevel?: number): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${this.apiUrl}/poste`, {
      employeeId,
      nouveauPoste,
      nouveauDepartement,
      nouveauJobLevel
    });
  }

  simulerFormation(employeeId: number, nombreFormations: number): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${this.apiUrl}/formation`, {
      employeeId,
      nombreFormations
    });
  }

  comparerScenarios(employeeId: number): Observable<ComparaisonSimulation> {
    return this.http.get<ComparaisonSimulation>(`${this.apiUrl}/comparer/${employeeId}`);
  }
}
