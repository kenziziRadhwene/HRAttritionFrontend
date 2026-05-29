// src/app/features/admin-dashboard/admin-dashboard.component.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { Chart, registerables } from 'chart.js';

import { AdminDashboardService } from '../../core/services/admin-dashboard.service';
import { AdminDashboardStats } from '../../shared/models/admin-dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl:    './admin-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None // Permet un ciblage propre des cartes imbriquées
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('lineChart')     lineChartRef!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef<HTMLCanvasElement>;

  stats: AdminDashboardStats | null = null;
  loading = true;
  error   = false;

  private lineChart?:     Chart;
  private doughnutChart?: Chart;

  readonly ROLE_LABELS: Record<string, string> = {
    ADMIN:          'Administrateur',
    RESPONSABLE_RH: 'Responsable RH',
    MANAGER:        'Manager',
    USER:           'Utilisateur'
  };

  readonly ACTION_LABELS: Record<string, string> = {
    LOGIN:                        'Connexion',
    LOGOUT:                       'Déconnexion',
    USER_CREATE:                  'Création utilisateur',
    USER_UPDATE:                  'Modification utilisateur',
    USER_DELETE:                  'Suppression utilisateur',
    PROFILE_UPDATE:               'Mise à jour profil',
    EMPLOYEE_CREATE:              'Ajout employé',
    EMPLOYEE_UPDATE:              'Modification employé',
    EMPLOYEE_DELETE:              'Suppression employé',
    EMPLOYEE_IMPORT:              'Import employés',
    PREDICTION_INDIVIDUELLE:      'Prédiction individuelle',
    PREDICTION_BATCH:             'Prédiction batch',
    PREDICTION_BATCH_DEPARTEMENT: 'Prédiction batch département',
    SIMULATION_SALAIRE:           'Simulation salaire',
    SIMULATION_POSTE:             'Simulation poste',
    SIMULATION_FORMATION:         'Simulation formation'
  };

  constructor(private adminDashboardService: AdminDashboardService) {}

  ngOnInit(): void { this.loadDashboard(); }
  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.lineChart?.destroy();
    this.doughnutChart?.destroy();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error   = false;
    this.adminDashboardService.getDashboard().subscribe({
      next: data => {
        this.stats   = data;
        this.loading = false;
        setTimeout(() => { this.initLineChart(); this.initDoughnutChart(); }, 100);
      },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  private initLineChart(): void {
    if (!this.stats || !this.lineChartRef) return;
    this.lineChart?.destroy();

    const labels = Object.keys(this.stats.activiteHebdomadaire).map(d =>
      new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    );
    const values = Object.values(this.stats.activiteHebdomadaire);

    this.lineChart = new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: "Nombre d'actions",
          data: values,
          borderColor: '#ED1C24', // Rouge vif de ta charte graphique claire
          backgroundColor: 'rgba(237, 28, 36, 0.06)', // Remplissage rouge très léger
          borderWidth: 2.5,
          pointBackgroundColor: '#ED1C24',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => { const v = ctx.parsed.y ?? 0; return ` ${v} action${v > 1 ? 's' : ''}`; } } }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0, 0, 0, 0.04)' }, // Grilles claires discrètes
            ticks: { color: '#494848', font: { size: 10 } } // Texte anthracite de ton modèle
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.04)' },
            ticks: { color: '#494848', precision: 0, font: { size: 10 } }
          }
        }
      }
    });
  }

  private initDoughnutChart(): void {
    if (!this.stats || !this.doughnutChartRef) return;
    this.doughnutChart?.destroy();

    const labels = Object.keys(this.stats.repartitionParRole).map(r => this.ROLE_LABELS[r] ?? r);
    const values = Object.values(this.stats.repartitionParRole);

    this.doughnutChart = new Chart(this.doughnutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          // Couleurs synchronisées à 100% avec tes variables SCSS claires
          backgroundColor: [
            '#ED1C24', // Rouge (Admin)
            '#FF6B00', // Orange (RH)
            '#0288d1', // Bleu (Manager)
            '#706fd3'  // Violet (Utilisateur)
          ],
          borderWidth: 2,
          borderColor: '#ffffff', // Bordures blanches nettes pour se détacher sur le fond blanc de la carte
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false }, // Tes légendes HTML personnalisées (role-totals) s'en occupent déjà
          tooltip: { callbacks: { label: ctx => ` ${ctx.label} : ${ctx.parsed} utilisateur${ctx.parsed > 1 ? 's' : ''}` } }
        }
      }
    });
  }

  getRoleLabel(role: string): string { return this.ROLE_LABELS[role] ?? role; }
  getActionLabel(action: string): string { return this.ACTION_LABELS[action] ?? action; }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'badge-admin',
      RESPONSABLE_RH: 'badge-rh',
      MANAGER: 'badge-manager',
      USER: 'badge-user'
    };
    return map[role] ?? 'badge-default';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
