import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee } from '../../shared/models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private apiUrl = `${environment.apiUrl}/employees`;
  private scoresUrl = `${environment.apiUrl}/scores`; // ⭐ Ajouté

  constructor(private http: HttpClient) {}

  // Employees
  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  create(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  update(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  predict(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/predict`, {});
  }

  getByDepartment(department: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/by-department/${department}`);
  }

  // ⭐ Scores / Historique
  getScoreHistory(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.scoresUrl}/employee/${employeeId}`);
  }

  getLatestScore(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.scoresUrl}/employee/${employeeId}/latest`);
  }

  getRecommendations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.scoresUrl}/recommandations`);
  }

  getRecommendationsForEmployee(employeeId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/recommendations/employee/${employeeId}`);
  }


  // ⭐ Prédiction batch (tous les employés)
  predictAll(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/batch-predictions/all`, {});
  }

// ⭐ Prédiction batch par département
  predictByDepartment(department: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/batch-predictions/department/${department}`, {});
  }

// ⭐ Vérifier le statut du batch
  getBatchStatus(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/batch-predictions/status`);
  }



}
