import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

import { ScoreRisqueService } from '../../../core/services/score-risque.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ScoreRisque } from '../../../shared/models/score-risque.model';
import { Employee } from '../../../shared/models/employee.model';

Chart.register(...registerables);

@Component({
  selector: 'app-employee-historique',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    BaseChartDirective,
  ],
  templateUrl: './employee-historique.component.html',
  styleUrls: ['./employee-historique.component.scss'],
})
export class EmployeeHistoriqueComponent implements OnInit {

  employeeId!: number;
  employee: Employee | null = null;
  historique: ScoreRisque[] = [];
  loading = true;
  error = false;

  displayedColumns = ['date', 'probabilite', 'niveauRisque', 'seuil', 'modele'];

  // ── KPIs ──────────────────────────────────────────────
  get scoreActuel(): number {
    return this.historique.length > 0 ? this.historique[0].probabilite : 0;
  }
  get scoreMin(): number {
    return this.historique.length > 0
      ? Math.min(...this.historique.map(s => s.probabilite))
      : 0;
  }
  get scoreMax(): number {
    return this.historique.length > 0
      ? Math.max(...this.historique.map(s => s.probabilite))
      : 0;
  }
  get tendance(): 'hausse' | 'baisse' | 'stable' {
    if (this.historique.length < 2) return 'stable';
    const diff = this.historique[0].probabilite - this.historique[1].probabilite;
    if (diff > 0.02) return 'hausse';
    if (diff < -0.02) return 'baisse';
    return 'stable';
  }

  // ── Chart.js ──────────────────────────────────────────
  chartData: ChartData<'line'> = { labels: [], datasets: [] };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeInOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#ffffff',
        bodyColor: '#cccccc',
        borderColor: '#D40000',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` Probabilité : ${((ctx.parsed.y ?? 0) * 100).toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888888', font: { size: 11 }, maxRotation: 45 },
      },
      y: {
        min: 0,
        max: 1,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#888888',
          font: { size: 11 },
          callback: (val) => `${(+val * 100).toFixed(0)}%`,
          stepSize: 0.1,
        },
      },
    },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scoreService: ScoreRisqueService,
    private employeeService: EmployeeService,
  ) {}

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Charger l'employé
    this.employeeService.getById(this.employeeId).subscribe({
      next: (emp: Employee) => (this.employee = emp),
      error: () => (this.employee = null),
    });

    // Charger l'historique
    this.scoreService.getHistorique(this.employeeId).subscribe({
      next: (scores) => {
        // Tri chronologique (du plus ancien au plus récent) pour le graphique
        this.historique = scores; // tableau descendant pour le tableau
        const chronologique = [...scores].reverse();
        this.buildChart(chronologique);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  buildChart(chronologique: ScoreRisque[]): void {
    const labels = chronologique.map(s =>
      new Date(s.dateCalcul).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: '2-digit',
      })
    );
    const data = chronologique.map(s => s.probabilite);

    // Couleurs dynamiques selon le niveau de risque
    const pointColors = chronologique.map(s => this.getNiveauColor(s.niveauRisque));

    this.chartData = {
      labels,
      datasets: [
        {
          data,
          label: 'Probabilité d\'attrition',
          fill: true,
          tension: 0.4,
          borderColor: '#D40000',
          borderWidth: 2.5,
          backgroundColor: 'rgba(212, 0, 0, 0.08)',
          pointBackgroundColor: pointColors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 9,
        },
      ],
    };
  }

  // ── Helpers ──────────────────────────────────────────
  getNiveauColor(niveau: string): string {
    switch (niveau) {
      case 'ÉLEVÉ': return '#D40000';
      case 'MOYEN': return '#FF6B00';
      default:      return '#2E7D32';
    }
  }

  getNiveauClass(niveau: string): string {
    switch (niveau) {
      case 'ÉLEVÉ': return 'badge-eleve';
      case 'MOYEN': return 'badge-moyen';
      default:      return 'badge-faible';
    }
  }

  getNiveauIcon(niveau: string): string {
    switch (niveau) {
      case 'ÉLEVÉ': return 'trending_up';
      case 'MOYEN': return 'trending_flat';
      default:      return 'trending_down';
    }
  }

  formatProbabilite(p: number): string {
    return `${(p * 100).toFixed(1)}%`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  goBack(): void {
    this.router.navigate(['/employees', this.employeeId]);
  }

  goToSimulation(): void {
    this.router.navigate(['/simulation'], {
      queryParams: { employeeId: this.employeeId },
    });
  }
}
