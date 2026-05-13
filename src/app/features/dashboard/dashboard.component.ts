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
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../shared/models/dashboard.model';

Chart.register(...registerables);

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
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDividerModule,
    MatTooltipModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats | null = null;
  loading = true;
  displayedColumns = ['nom', 'matricule', 'probabilite', 'niveauRisque'];


  departements = [
    'DIRECTION_GENERALE',
    'DIRECTION_RESSOURCES_HUMAINES',
    'DIRECTION_ADMINISTRATIVE_FINANCIERE',
    'DIRECTION_JURIDIQUE',
    'DIRECTION_TECHNOLOGIQUE',
    'DIRECTION_RELATIONS_OPERATEURS',
    'DIRECTION_SERVICE_CLIENT'
  ];

  niveauxRisque = ['ÉLEVÉ', 'MOYEN', 'FAIBLE'];
  selectedDepartement = '';
  selectedNiveauRisque = '';





  private deptLabels: { [key: string]: string } = {
    'DIRECTION_GENERALE':                  'Dir. Générale',
    'DIRECTION_RESSOURCES_HUMAINES':       'Dir. RH',
    'DIRECTION_ADMINISTRATIVE_FINANCIERE': 'Dir. Admin & Finance',
    'DIRECTION_JURIDIQUE':                 'Dir. Juridique',
    'DIRECTION_TECHNOLOGIQUE':             'Dir. Technologique',
    'DIRECTION_RELATIONS_OPERATEURS':      'Dir. Relations Op.',
    'DIRECTION_SERVICE_CLIENT':            'Dir. Service Client',
  };

  // ══════════════════════════════════════════════════════
  // CHART 1 — Donut
  // ══════════════════════════════════════════════════════
  donutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16, color: '#494848' } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label} : ${ctx.parsed} employés` } },
    },
  };

  // ══════════════════════════════════════════════════════
  // CHART 2 — Bar groupé + ligne turnover
  // ══════════════════════════════════════════════════════
  barDeptData: ChartData<any> = { labels: [], datasets: [] };
  barDeptOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 11 }, color: '#494848', padding: 14 } },
      tooltip: { backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#ccc', borderColor: '#D40000', borderWidth: 1, padding: 10 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#888', font: { size: 10 }, maxRotation: 30 } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 11 } },
        title: { display: true, text: 'Nb employés', color: '#888', font: { size: 11 } },
      },
    },
  };




  barTurnoverData: ChartData<'bar'> = { labels: [], datasets: [] };
  barTurnoverOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` Taux turnover : ${ctx.parsed.x}%` } },
    },
    scales: {
      x: {
        beginAtZero: true, max: 100,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 11 }, callback: (val) => `${val}%` },
        title: { display: true, text: 'Taux de turnover prédit (%)', color: '#888', font: { size: 11 } },
      },
      y: { grid: { display: false }, ticks: { color: '#494848', font: { size: 12 } } },
    },
  };

  // ══════════════════════════════════════════════════════
  // CHART 3 — Bar horizontal facteurs
  // ══════════════════════════════════════════════════════
  barFacteursData: ChartData<'bar'> = { labels: [], datasets: [] };
  barFacteursOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` Contribution : ${ctx.parsed.x}%` } },
    },
    scales: {
      x: {
        beginAtZero: true, max: 15,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 11 }, callback: (val) => `${val}%` },
      },
      y: { grid: { display: false }, ticks: { color: '#494848', font: { size: 12 } } },
    },
  };

  // ══════════════════════════════════════════════════════
  // CHART 4 — Line Chart évolution mensuelle
  // ══════════════════════════════════════════════════════
// Chart 4 devient dynamique
  lineData: ChartData<'line'> = { labels: [], datasets: [] };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 }, color: '#494848', padding: 16 } },
      tooltip: { backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#ccc', borderColor: '#D40000', borderWidth: 1, padding: 10 },
    },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#888', font: { size: 11 } } },
      y: {
        beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 11 } },
        title: { display: true, text: 'Nb employés à risque', color: '#888', font: { size: 11 } },
      },
    },
  };

  // ══════════════════════════════════════════════════════
  // CHART 5 — Histogramme distribution des scores
  // ══════════════════════════════════════════════════════
  histoData: ChartData<'bar'> = { labels: [], datasets: [] };
  histoOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => `Tranche ${items[0].label}`,
          label: (ctx) => ` ${ctx.parsed.y} employés dans cette tranche`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#494848', font: { size: 11 } },
        title: { display: true, text: 'Score de risque (%)', color: '#888', font: { size: 11 } },
      },
      y: {
        beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 11 } },
        title: { display: true, text: 'Nb employés', color: '#888', font: { size: 11 } },
      },
    },
  };

  // ══════════════════════════════════════════════════════
  // CHART 6 — Courbe prédictive IA vs Réelle
  // ══════════════════════════════════════════════════════
  predVsRealData: ChartData<'line'> = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Prédictions IA',
        data: [14, 16, 15, 19, 23, 21, 26, 24, 28, 25, 29, 20],
        borderColor: '#D40000', backgroundColor: 'rgba(212,0,0,0.0)',
        fill: false, tension: 0.4, pointRadius: 5, pointHoverRadius: 8, borderWidth: 2.5,
      },
      {
        label: 'Départs réels',
        data: [12, 15, 14, 18, 22, 20, 24, 23, 27, 24, 28, 19],
        borderColor: '#1565C0', backgroundColor: 'rgba(21,101,192,0.0)',
        fill: false, tension: 0.4, pointRadius: 5, pointHoverRadius: 8, borderWidth: 2.5,
        borderDash: [6, 3],
      },
    ],
  };

  predVsRealOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 }, color: '#494848', padding: 16 } },
      tooltip: {
        backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#ccc',
        borderColor: '#D40000', borderWidth: 1, padding: 10,
        callbacks: { label: (ctx) => ` ${ctx.dataset.label} : ${ctx.parsed.y} employés` },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#888', font: { size: 11 } } },
      y: {
        beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 11 } },
        title: { display: true, text: 'Nb employés', color: '#888', font: { size: 11 } },
      },
    },
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {
   



  }

  ngOnInit(): void {
    this.loadStats();
    this.loadEvolutionMensuelle();
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => { this.stats = data; this.buildCharts(data); this.loading = false; },
      error: (err) => { console.error('Erreur dashboard:', err); this.loading = false; }
    });
  }

  loadEvolutionMensuelle(): void {
    this.dashboardService.getEvolutionMensuelle().subscribe({
      next: (data) => {
        this.lineData = {
          labels: data.map(d => d.moisLabel),
          datasets: [
            {
              label: 'Risque Élevé',
              data: data.map(d => d.risqueEleve),
              borderColor: '#D40000',
              backgroundColor: 'rgba(212,0,0,0.08)',
              fill: true, tension: 0.4,
              pointRadius: 5, pointHoverRadius: 8, borderWidth: 2.5,
            },
            {
              label: 'Risque Moyen',
              data: data.map(d => d.risqueMoyen),
              borderColor: '#FF6B00',
              backgroundColor: 'rgba(255,107,0,0.06)',
              fill: true, tension: 0.4,
              pointRadius: 5, pointHoverRadius: 8, borderWidth: 2.5,
            },
          ],
        };
      },
      error: () => console.error('Erreur évolution mensuelle')
    });
  }

  appliquerFiltres(): void {
    this.loading = true;
    this.dashboardService.getStatsFiltered(
      this.selectedDepartement || undefined,
      this.selectedNiveauRisque || undefined
    ).subscribe({
      next: (data) => { this.stats = data; this.buildCharts(data); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  reinitialiserFiltres(): void {
    this.selectedDepartement = '';
    this.selectedNiveauRisque = '';
    this.loadStats();
  }

  buildCharts(data: DashboardStats): void {
    this.buildDonut(data);
    this.buildBarDept(data);
    this.buildBarFacteurs(data);
    this.buildHistogramme(data);
  }

  buildDonut(data: DashboardStats): void {
    this.donutData = {
      labels: ['Risque Élevé', 'Risque Moyen', 'Risque Faible'],
      datasets: [{
        data: [data.risqueEleve, data.risqueMoyen, data.risqueFaible],
        backgroundColor: ['#D40000', '#FF6B00', '#2E7D32'],
        borderColor: ['#AA0000', '#E65100', '#1B5E20'],
        borderWidth: 2, hoverOffset: 8,
      }],
    };
  }

  buildBarDept(data: DashboardStats): void {
    const depts  = Object.keys(data.repartitionRisqueParDepartement);
    const labels = depts.map(d => this.deptLabels[d] || d);
    const eleve  = depts.map(d => data.repartitionRisqueParDepartement[d]?.['ÉLEVÉ']  ?? 0);
    const moyen  = depts.map(d => data.repartitionRisqueParDepartement[d]?.['MOYEN']  ?? 0);
    const faible = depts.map(d => data.repartitionRisqueParDepartement[d]?.['FAIBLE'] ?? 0);
    const taux   = depts.map(d => data.tauxTurnoverParDepartement?.[d] ?? 0);

    // Chart 2A — Bar groupé ÉLEVÉ/MOYEN/FAIBLE
    this.barDeptData = {
      labels,
      datasets: [
        { label: 'Risque Élevé',  data: eleve,  backgroundColor: 'rgba(212,0,0,0.8)',    borderColor: '#D40000', borderWidth: 1, borderRadius: 4 },
        { label: 'Risque Moyen',  data: moyen,  backgroundColor: 'rgba(255,107,0,0.8)', borderColor: '#FF6B00', borderWidth: 1, borderRadius: 4 },
        { label: 'Risque Faible', data: faible, backgroundColor: 'rgba(46,125,50,0.8)', borderColor: '#2E7D32', borderWidth: 1, borderRadius: 4 },
      ],
    };

    // Chart 2B — Bar horizontal taux turnover
    const turnoverColors = taux.map(t => t >= 50 ? 'rgba(212,0,0,0.8)' : t >= 25 ? 'rgba(255,107,0,0.8)' : 'rgba(21,101,192,0.8)');
    this.barTurnoverData = {
      labels,
      datasets: [{
        data: taux,
        backgroundColor: turnoverColors,
        borderColor: turnoverColors.map(c => c.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 4,
      }],
    };
  }

  buildBarFacteurs(data: DashboardStats): void {
    if (!data.topFacteursRisque?.length) return;
    const labels = data.topFacteursRisque.map(f => f.featureLabel);
    const values = data.topFacteursRisque.map(f => f.pourcentage);
    const colors = values.map((_, i) => {
      const ratio = i / Math.max(values.length - 1, 1);
      const g = Math.round(ratio * 107);
      return `rgba(212,${g},0,0.85)`;
    });
    this.barFacteursData = {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderColor: colors.map(c => c.replace('0.85', '1')), borderWidth: 1, borderRadius: 4 }],
    };
  }

  buildHistogramme(data: DashboardStats): void {
    const tranches = ['0–20%', '20–40%', '40–60%', '60–80%', '80–100%'];
    const dist = [
      Math.round(data.risqueFaible * 0.4),
      Math.round(data.risqueFaible * 0.6),
      Math.round(data.risqueMoyen  * 0.5),
      Math.round(data.risqueMoyen  * 0.5),
      data.risqueEleve,
    ];
    const barColors = [
      'rgba(46,125,50,0.85)',
      'rgba(46,125,50,0.6)',
      'rgba(255,107,0,0.75)',
      'rgba(255,107,0,0.9)',
      'rgba(212,0,0,0.85)',
    ];
    this.histoData = {
      labels: tranches,
      datasets: [{
        label: 'Employés',
        data: dist,
        backgroundColor: barColors,
        borderColor: barColors.map(c => c.replace(/[\d.]+\)$/, '1)')),
        borderWidth: 1,
        borderRadius: 6,
      }],
    };
  }

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






}
