import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

import { ScoreRisqueService } from '../../../core/services/score-risque.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ScoreRisque } from '../../../shared/models/score-risque.model';
import { Employee } from '../../../shared/models/employee.model';

Chart.register(...registerables, annotationPlugin);

@Component({
  selector: 'app-employee-historique',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    BaseChartDirective,
  ],
  templateUrl: './employee-historique.component.html',
  styleUrls: ['./employee-historique.component.scss'],
})
export class EmployeeHistoriqueComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  employeeId!: number;
  employee: Employee | null = null;
  historique: ScoreRisque[] = [];
  dataSource = new MatTableDataSource<ScoreRisque>([]);
  loading = true;
  error = false;

  displayedColumns = ['date', 'probabilite', 'niveauRisque', 'modele'];

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
      // ── Ligne de seuil via annotation plugin ──────────
      annotation: {
        annotations: {
          seuilLine: {
            type: 'line',
            yMin: 0,    // sera mis à jour dans buildChart()
            yMax: 0,
            borderColor: '#D40000',
            borderWidth: 1.5,
            borderDash: [6, 4],
            label: {
              display: true,
              content: 'Seuil de risque',
              position: 'end',
              backgroundColor: 'rgba(212,0,0,0.08)',
              color: '#D40000',
              font: { size: 11, weight: 'bold' },
              padding: { x: 8, y: 4 },
              borderRadius: 4,
            },
          },
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

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadData(): void {
    this.loading = true;
    this.error = false;

    // ── forkJoin : les deux requêtes en parallèle, résultat synchronisé ──
    forkJoin({
      employee: this.employeeService.getById(this.employeeId),
      scores: this.scoreService.getHistorique(this.employeeId),
    }).subscribe({
      next: ({ employee, scores }) => {
        this.employee = employee;
        this.historique = scores;                    // ordre descendant pour les KPIs
        this.dataSource.data = scores;
        const chronologique = [...scores].reverse(); // ordre ascendant pour le graphique
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
    const pointColors = chronologique.map(s => this.getNiveauColor(s.niveauRisque));

    // Mettre à jour la valeur de l'annotation de seuil
    const seuil = chronologique.length > 0 ? chronologique[chronologique.length - 1].seuilUtilise : 0.5;
    const annotations = (this.chartOptions as any).plugins.annotation.annotations;
    annotations.seuilLine.yMin = seuil;
    annotations.seuilLine.yMax = seuil;

    this.chartData = {
      labels,
      datasets: [
        {
          data,
          label: "Probabilité d'attrition",
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
