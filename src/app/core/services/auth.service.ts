import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {environment} from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────
  // Login
  // ─────────────────────────────────────
  login(email: string, motDePasse: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, motDePasse }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
      })
    );
  }

  // ─────────────────────────────────────
  // Logout
  // ─────────────────────────────────────
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ─────────────────────────────────────
  // Vérifier si connecté
  // ─────────────────────────────────────
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ─────────────────────────────────────
  // Récupérer le token
  // ─────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ─────────────────────────────────────
  // Récupérer l'utilisateur connecté
  // ─────────────────────────────────────
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
