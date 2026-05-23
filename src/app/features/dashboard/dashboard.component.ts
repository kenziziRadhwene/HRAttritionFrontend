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
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats | null = null;
  loading = true;
  displayedColumns = ['nom', 'matricule', 'probabilite', 'niveauRisque'];

  // Couleur dynamique selon le niveau de risque global
  getRisqueGlobalColor(): string {
    const val = this.stats?.risqueGlobalDepart ?? 0;
    if (val >= 50) return '#c62828';
    if (val >= 25) return '#ef6c00';
    return '#2e7d32';
  }

  getRisqueGlobalBorderColor(): string {
    const val = this.stats?.risqueGlobalDepart ?? 0;
    if (val >= 50) return '#D40000';
    if (val >= 25) return '#f57c00';
    return '#2e7d32';
  }

  getRisqueGlobalLabel(): string {
    const val = this.stats?.risqueGlobalDepart ?? 0;
    if (val >= 50) return 'Critique';
    if (val >= 25) return 'Modéré';
    return 'Faible';
  }

  private deptLabels: { [key: string]: string } = {
    'DIRECTION_GENERALE':                  'Dir. Générale',
    'DIRECTION_RESSOURCES_HUMAINES':       'Dir. RH',
    'DIRECTION_ADMINISTRATIVE_FINANCIERE': 'Dir. Admin. Fin.',
    'DIRECTION_JURIDIQUE':                 'Dir. Juridique',
    'DIRECTION_TECHNOLOGIQUE':             'Dir. Tech.',
    'DIRECTION_RELATIONS_OPERATEURS':      'Dir. Rel. Op.',
    'DIRECTION_SERVICE_CLIENT':            'Dir. Svc Client',
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
      legend: {
        position: 'bottom',
        labels: { font: { size: 9 }, padding: 8, color: '#494848' },
      },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label} : ${ctx.parsed} employés` } },
    },
  };

  // ══════════════════════════════════════════════════════
  // CHART 2A — Bar groupé par département
  // ══════════════════════════════════════════════════════
  barDeptData: ChartData<any> = { labels: [], datasets: [] };
  barDeptOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 9 }, color: '#494848', padding: 8 } },
      tooltip: {
        backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#ccc',
        borderColor: '#D40000', borderWidth: 1, padding: 8,
        callbacks: {
          title: (items) => {
            const idx = items[0].dataIndex;
            return (items[0].chart.data.labels?.[idx] as string) ?? '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        afterFit: (axis: any) => { axis.height = 60; },
        ticks: {
          color: '#888',
          font: { size: 9 },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 9 } },
        title: { display: true, text: 'Nb employés', color: '#888', font: { size: 9 } },
      },
    },
  };

  // ══════════════════════════════════════════════════════
  // CHART 2B — Bar horizontal taux turnover
  // ══════════════════════════════════════════════════════
  barTurnoverData: ChartData<'bar'> = { labels: [], datasets: [] };
  barTurnoverOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: { padding: { left: 0, right: 10 } },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` Taux turnover : ${ctx.parsed.x}%` } },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 9 }, callback: (val) => `${val}%` },
        title: { display: true, text: 'Taux de turnover prédit (%)', color: '#888', font: { size: 9 } },
      },
      y: {
        grid: { display: false },
        afterFit: (axis: any) => { axis.width = 175; },
        ticks: {
          color: '#494848',
          font: { size: 10 },
          autoSkip: false,
          maxRotation: 0,
        },
      },
    },
  };

  // ══════════════════════════════════════════════════════
  // CHART 3 — Bar horizontal facteurs de risque
  // ══════════════════════════════════════════════════════
  barFacteursData: ChartData<'bar'> = { labels: [], datasets: [] };
  barFacteursOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: { padding: { left: 0, right: 10 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: '#D40000',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          // Affiche le label complet (non tronqué) dans le tooltip
          title: (items) => {
            const key = items[0]?.label ?? '';
            return this.facteurTooltips[key] ?? key;
          },
          label: (ctx) => ` Impact sur le risque de départ : ${ctx.parsed.x}%`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 15,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 9 }, callback: (val) => `${val}%` },
      },
      y: {
        grid: { display: false },
        afterFit: (axis: any) => { axis.width = 210; },
        ticks: {
          color: '#494848',
          font: { size: 10 },
          autoSkip: false,
          maxRotation: 0,
        },
      },
    },
  };

  // ══════════════════════════════════════════════════════
  // CHART 4 — Line Chart évolution mensuelle
  // ══════════════════════════════════════════════════════
  lineData: ChartData<'line'> = { labels: [], datasets: [] };
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { font: { size: 9 }, color: '#494848', padding: 8 } },
      tooltip: {
        backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#ccc',
        borderColor: '#D40000', borderWidth: 1, padding: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 9 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 9 } },
        title: { display: true, text: 'Taux de risque global (%)', color: '#888', font: { size: 9 } },
      },
    },
  };

  // ══════════════════════════════════════════════════════
  // CHART 5 — Histogramme distribution des scores
  // ══════════════════════════════════════════════════════
  histoData: ChartData<'bar'> = { labels: [], datasets: [] };
  histoOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
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
        ticks: { color: '#494848', font: { size: 9 } },
        title: { display: true, text: 'Score de risque (%)', color: '#888', font: { size: 9 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 9 } },
        title: { display: true, text: 'Nb employés', color: '#888', font: { size: 9 } },
      },
    },
  };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadEvolutionMensuelle();
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => { this.stats = data; this.buildCharts(data); this.loading = false; },
      error: (err) => { console.error('Erreur dashboard:', err); this.loading = false; },
    });
  }

  loadEvolutionMensuelle(): void {
    this.dashboardService.getEvolutionMensuelle().subscribe({
      next: (data) => {
        this.lineData = {
          labels: data.map(d => d.moisLabel),
          datasets: [
            {
              label: 'Taux de risque global',
              data: data.map(d => d.tauxRisqueGlobal),
              borderColor: '#D40000',
              backgroundColor: 'rgba(212,0,0,0.08)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 7,
              borderWidth: 2,
            },
          ],
        };
      },
      error: () => console.error('Erreur évolution mensuelle'),
    });
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
        backgroundColor: ['#D40000', '#FFB347', '#43A047'],
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 8,
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

    this.barDeptData = {
      labels,
      datasets: [
        { label: 'Risque Élevé',  data: eleve,  backgroundColor: 'rgba(212,0,0,0.8)',    borderColor: '#D40000', borderWidth: 1, borderRadius: 0 },
        { label: 'Risque Moyen',  data: moyen,  backgroundColor: 'rgba(255,107,0,0.8)', borderColor: '#FF6B00', borderWidth: 1, borderRadius: 0 },
        { label: 'Risque Faible', data: faible, backgroundColor: 'rgba(46,125,50,0.8)', borderColor: '#2E7D32', borderWidth: 1, borderRadius: 0 },
      ],
    };

    const turnoverColors = taux.map(t =>
      t >= 50 ? 'rgba(212,0,0,0.8)' : t >= 25 ? 'rgba(255,107,0,0.8)' : 'rgba(21,101,192,0.8)'
    );
    this.barTurnoverData = {
      labels,
      datasets: [{
        data: taux,
        backgroundColor: turnoverColors,
        borderColor: turnoverColors.map(c => c.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 0,
      }],
    };
  }

  // ══════════════════════════════════════════════════════
  // Labels affichés sur le graphique (courts, lisibles)
  // Formulés comme des CAUSES d'attrition
  // ══════════════════════════════════════════════════════
  private readonly facteurAbbr: { [key: string]: string } = {
    'Ancienneté':              'Stagnation dans le poste',
    'Satisfaction':            'Insatisfaction au travail',
    'Surcharge':               'Surcharge de travail',
    'Équilibre vie':           'Déséquilibre vie pro / perso',
    'Ambiance travail':        'Mauvaise ambiance de travail',
    'Années entreprise':       'Faible ancienneté dans l\'entreprise',
    'Mobilité':                'Profil multi-employeurs',
    'Tranche d\'âge à risque': 'Tranche d\'âge à risque',
  };

  // ══════════════════════════════════════════════════════
  // Descriptions complètes affichées dans le TOOLTIP au survol
  // ══════════════════════════════════════════════════════
  private readonly facteurTooltips: { [key: string]: string } = {
    'Poste peu valorisant':          'Le poste occupé (CSP) est associé à un fort risque de départ',
    'Insatisfaction au travail':     'L\'employé exprime une faible satisfaction vis-à-vis de son travail',
    'Surcharge selon le grade':      'Les heures supplémentaires sont élevées par rapport au niveau hiérarchique',
    'Surcharge de travail':          'Volume d\'heures supplémentaires excessif par rapport à la norme',
    'Déséquilibre vie pro / perso':  'Mauvais équilibre entre vie professionnelle et vie personnelle',
    'Mauvaises conditions de travail': 'Insatisfaction liée à l\'environnement physique ou organisationnel',
    'Faible ancienneté':             'L\'employé est dans l\'entreprise depuis peu de temps',
    'Stagnation dans le poste':      'L\'employé occupe le même poste depuis trop longtemps sans évolution',
    'Profil multi-employeurs':       'L\'employé a travaillé dans de nombreuses entreprises, signe d\'instabilité',
    'Tranche d\'âge à risque':       'La tranche d\'âge de l\'employé est statistiquement plus sujette au départ',
    'Trajet domicile trop long':     'La distance domicile-travail est un facteur de démotivation',
    'Rémunération insuffisante':     'Le salaire perçu est en dessous des attentes ou du marché',
    'Manque de formation':           'L\'employé n\'a pas bénéficié de suffisamment de formations',
    'Absentéisme élevé':             'Un nombre élevé d\'absences est un signal précurseur de départ',
    'Expérience insuffisante':       'Le niveau d\'expérience de l\'employé le rend plus vulnérable au départ',
  };

  buildBarFacteurs(data: DashboardStats): void {
    if (!data.topFacteursRisque?.length) return;

    // Traduit le featureLabel backend en label RH clair
    const labels = data.topFacteursRisque.map(f =>
      this.facteurAbbr[f.featureLabel] ?? f.featureLabel
    );
    const values = data.topFacteursRisque.map(f => f.pourcentage);

    const colors = values.map((_, i) => {
      const ratio = i / Math.max(values.length - 1, 1);
      const g = Math.round(ratio * 107);
      return `rgba(212,${g},0,0.85)`;
    });

    this.barFacteursData = {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.85', '1')),
        borderWidth: 1,
        borderRadius: 0,
      }],
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
      default:      return 'primary';
    }
  }

  getRisqueIcon(niveau: string): string {
    switch (niveau) {
      case 'ÉLEVÉ': return 'dangerous';
      case 'MOYEN': return 'warning';
      default:      return 'check_circle';
    }
  }
}
