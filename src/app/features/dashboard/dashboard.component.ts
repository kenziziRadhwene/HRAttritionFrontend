import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
// ===== NOUVEAUX IMPORTS À AJOUTER =====
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
// ===== FIN DES NOUVEAUX IMPORTS =====

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../shared/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatBadgeModule,
    // ===== NOUVEAUX MODULES À AJOUTER =====
    FormsModule,
    MatSelectModule,
    MatFormFieldModule
    // ===== FIN DES NOUVEAUX MODULES =====
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats | null = null;
  loading = true;
  displayedColumns = ['nom', 'matricule', 'departement', 'probabilite', 'niveauRisque'];

  // ===== NOUVELLES PROPRIÉTÉS POUR LES FILTRES =====
  // Liste des départements
  departements = [
    'DIRECTION_GENERALE',
    'DIRECTION_RESSOURCES_HUMAINES',
    'DIRECTION_ADMINISTRATIVE_FINANCIERE',
    'DIRECTION_JURIDIQUE',
    'DIRECTION_TECHNOLOGIQUE',
    'DIRECTION_RELATIONS_OPERATEURS',
    'DIRECTION_COMMERCIALE',
    'DIRECTION_SERVICE_CLIENT',
    'DIRECTION_SYSTEMES_INFORMATION',
    'DIRECTION_OPERATIONS',
    'DIRECTION_TECHNIQUE_FIXE',
    'DIRECTION_INGENIERIE_RESEAUX',
    'DEPARTEMENT_PERFORMANCE_RESEAUX',
    'SERVICE_APPLICATION_VENTE',
    'SERVICE_DATA_ENGINEERING',
    'SERVICE_DASHBOARD_DATA_MINING'
  ];

  // Niveaux de risque
  niveauxRisque = ['ÉLEVÉ', 'MOYEN', 'FAIBLE'];

  // Valeurs sélectionnées
  selectedDepartement = '';
  selectedNiveauRisque = '';
  // ===== FIN DES NOUVELLES PROPRIÉTÉS =====

  // ===== NOUVELLES PROPRIÉTÉS POUR LES RÔLES =====
  isAdmin = false;
  isRH = false;
  isManager = false;
  // ===== FIN DES NOUVELLES PROPRIÉTÉS =====

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {
    // ===== INITIALISATION DES RÔLES =====
    this.isAdmin = this.authService.isAdmin();
    this.isRH = this.authService.isRH();
    this.isManager = this.authService.isManager();
    // ===== FIN DE L'INITIALISATION =====
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur dashboard:', err);
        this.loading = false;
      }
    });
  }

  // ===== NOUVELLES MÉTHODES POUR LES FILTRES =====
  /**
   * Applique les filtres sélectionnés
   */
  appliquerFiltres(): void {
    this.loading = true;
    this.dashboardService.getStatsFiltered(
      this.selectedDepartement || undefined,
      this.selectedNiveauRisque || undefined
    ).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de l\'application des filtres:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Réinitialise tous les filtres
   */
  reinitialiserFiltres(): void {
    this.selectedDepartement = '';
    this.selectedNiveauRisque = '';
    this.loadStats();
  }
  // ===== FIN DES NOUVELLES MÉTHODES =====

  getRisqueColor(niveau: string): string {
    switch (niveau) {
      case 'ÉLEVÉ': return 'warn';
      case 'MOYEN': return 'accent';
      default: return 'primary';
    }
  }

  getRisqueIcon(niveau: string): string {
    switch (niveau) {
      case 'ÉLEVÉ': return 'dangerous';
      case 'MOYEN': return 'warning';
      default: return 'check_circle';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
