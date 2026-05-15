import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../shared/models/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    BaseChartDirective,
  ],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss'
})
export class ManagerDashboardComponent implements OnInit {

  stats: DashboardStats | null = null;
  loading = true;

  // Infos du manager connecté (récupérées depuis AuthService)
  managerName = '';
  managerDepartement = '';

  // Risque global = moyenne des probabilités des employés du département
  risqueGlobal = 0;

  // Top 3 facteurs extraits de stats.topFacteursRisque
  top3Facteurs: { featureLabel: string; pourcentage: number }[] = [];

  // ── Bar chart répartition des niveaux de risque ──
  barRisqueData: ChartData<'bar'> = { labels: [], datasets: [] };
  barRisqueOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} employés`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#494848', font: { size: 13, weight: 'bold' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 11 } },
        title: { display: true, text: 'Nb employés', color: '#888', font: { size: 11 } }
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Utilise directement les méthodes de votre AuthService existant
    const user = this.authService.getCurrentUser();
    this.managerName = user?.prenom
      ? `${user.prenom} ${user.nom}`
      : user?.nom || user?.email || 'Manager';
    this.managerDepartement = this.authService.getDepartement() || '';

    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    // Appel filtré par département du manager
    this.dashboardService.getStatsByDepartement(this.managerDepartement).subscribe({
      next: (data) => {
        this.stats = data;
        this.buildRisqueGlobal(data);
        this.buildTop3Facteurs(data);
        this.buildBarChart(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur dashboard manager:', err);
        this.loading = false;
      }
    });
  }

  /** Calcule le risque global = tauxRisqueEleve (déjà calculé côté backend) */
  buildRisqueGlobal(data: DashboardStats): void {
    // tauxRisqueEleve est déjà un pourcentage (ex: 34.5)
    // Tu peux aussi utiliser une moyenne pondérée si le backend la retourne
    this.risqueGlobal = data.tauxRisqueEleve ?? 0;
  }

  /** Extrait les 3 premiers facteurs de topFacteursRisque */
  buildTop3Facteurs(data: DashboardStats): void {
    this.top3Facteurs = (data.topFacteursRisque ?? []).slice(0, 3);
  }

  /** Construit le bar chart avec 3 barres : Élevé, Moyen, Faible */
  buildBarChart(data: DashboardStats): void {
    this.barRisqueData = {
      labels: ['Risque Élevé', 'Risque Moyen', 'Risque Faible'],
      datasets: [{
        data: [data.risqueEleve, data.risqueMoyen, data.risqueFaible],
        backgroundColor: [
          'rgba(212, 0, 0, 0.85)',      // ← rouge — même que le fond de la card risque global
          'rgba(249, 168, 37, 0.85)',   // ← jaune — même que le chiffre du 3ème facteur
          'rgba(46, 125, 50, 0.55)',    // ← vert clair
        ],
        borderColor: ['#D40000', '#FF6B00', '#2E7D32'],
        borderWidth: 0,        // ← supprime le bordure
        borderRadius: 0,       // ← supprime le border radius

      }]
    };
  }

  /** Retourne la classe CSS selon le niveau de risque global */
  getRisqueGlobalClass(): string {
    if (this.risqueGlobal >= 60) return 'risk-high';
    if (this.risqueGlobal >= 30) return 'risk-medium';
    return 'risk-low';
  }

  voirPredictions(): void {
    this.router.navigate(['/employees']);  // ← même page que RH
  }
}
