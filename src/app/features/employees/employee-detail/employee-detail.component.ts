import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { EmployeeService } from '../../../core/services/employee.service';
import { ScoreRisqueService } from '../../../core/services/score-risque.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { Employee } from '../../../shared/models/employee.model';
import { ScoreRisque, FacteurRisque } from '../../../shared/models/score-risque.model';
import { Pipe, PipeTransform } from '@angular/core';
import {AuthService} from '../../../core/services/auth.service';

// ── Pipe formatage SNAKE_CASE → Texte lisible ──
@Pipe({ name: 'formatEnum', standalone: true })
export class FormatEnumPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    FormatEnumPipe,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss'
})
export class EmployeeDetailComponent implements OnInit {

  employee: Employee | null = null;
  latestScore: ScoreRisque | null = null;
  loading = true;
  isManager = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private scoreRisqueService: ScoreRisqueService,
    private breadcrumbService: BreadcrumbService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isManager = this.authService.getRole() === 'ROLE_MANAGER';  // ← ajoutez
    const id = +this.route.snapshot.params['id'];
    if (id) this.loadData(id);
  }

  // ── forkJoin : les deux appels partent en parallèle
  //    et on attend que les deux soient finis avant de continuer ──
  loadData(id: number): void {
    this.loading = true;

    forkJoin({
      employee: this.employeeService.getById(id),
      scores:   this.scoreRisqueService.getHistorique(id)
    }).subscribe({
      next: ({ employee, scores }) => {
        this.employee = employee;

        // Breadcrumb dynamique : remplace "Détail" par le vrai nom de l'employé
        this.breadcrumbService.setSegmentOverride(String(employee.id), {
          label: `${employee.firstName} ${employee.lastName}`,
          url: `/employees/${employee.id}`,
          icon: 'person'
        });

        if (scores && scores.length > 0) {
          this.latestScore = scores.sort((a, b) =>
            new Date(b.dateCalcul).getTime() - new Date(a.dateCalcul).getTime()
          )[0];
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.router.navigate(['/employees']);
      }
    });
  }

  // ── Getters SHAP + Recommandations ──
  getFacteurs(): FacteurRisque[] {
    if (!this.latestScore?.facteursPrincipaux) return [];
    try {
      const tous = JSON.parse(this.latestScore.facteursPrincipaux) as FacteurRisque[];
      const niveau = this.employee?.dernierNiveauRisque;
      if (niveau === 'ÉLEVÉ' || niveau === 'MOYEN') {
        return tous
          .filter(f => f.impact === 'AUGMENTE')
          .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
      } else {
        return tous
          .filter(f => f.impact === 'DIMINUE')
          .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
      }
    } catch { return []; }
  }

  getRecommandations(): string[] {
    if (!this.latestScore?.recommandations) return [];
    try {
      return JSON.parse(this.latestScore.recommandations);
    } catch { return []; }
  }

  // ── Satisfaction ──
  getSatisfactionItems(): { label: string; value: number }[] {
    if (!this.employee) return [];
    return [
      { label: 'Satisfaction au travail',    value: this.employee.jobSatisfaction },
      { label: 'Satisfaction environnement', value: this.employee.environmentSatisfaction },
      { label: 'Satisfaction relations',     value: this.employee.relationshipSatisfaction },
      { label: 'Implication au travail',     value: this.employee.jobInvolvement },
      { label: 'Équilibre vie pro/perso',    value: this.employee.workLifeBalance },
      { label: 'Performance',                value: this.employee.performanceRating },
    ];
  }

  // ── Formatage ──
  formatMarital(val: string): string {
    const map: Record<string, string> = {
      Single: 'Célibataire', Married: 'Marié(e)', Divorced: 'Divorcé(e)'
    };
    return map[val] ?? val;
  }

  formatEducation(val: number): string {
    const map: Record<number, string> = {
      1: 'Bac', 2: 'Bac+2', 3: 'Licence', 4: 'Master', 5: 'Doctorat'
    };
    return map[val] ?? `Niveau ${val}`;
  }

  formatTravel(val: string): string {
    const map: Record<string, string> = {
      'Non-Travel': 'Aucun déplacement',
      'Travel_Rarely': 'Rarement',
      'Travel_Frequently': 'Fréquemment'
    };
    return map[val] ?? val;
  }

  formatFeature(feature: string): string {
    const map: Record<string, string> = {
      JobSatisfaction:          'Satisfaction au travail',
      tenure_category:          'Catégorie ancienneté',
      overtime_x_joblevel:      'Heures sup × Niveau poste',
      WorkLifeBalance:          'Équilibre vie pro/perso',
      EnvironmentSatisfaction:  'Satisfaction environnement',
      JobInvolvement:           'Implication au travail',
      YearsAtCompany:           'Années dans l\'entreprise',
      Age:                      'Âge',
      tenure_satisfaction:      'Ancienneté × Satisfaction',
      NumCompaniesWorked:       'Nombre d\'entreprises',
      MonthlyIncome:            'Salaire mensuel',
      StockOptionLevel:         'Options sur actions',
      satisfaction_score:       'Score satisfaction global',
      promotion_rate:           'Taux de promotion',
      YearsSinceLastPromotion:  'Depuis dernière promotion',
      YearsWithCurrManager:     'Années avec manager actuel',
      job_hopping_score:        'Score mobilité entreprises',
      work_life_balance_score:  'Score équilibre vie',
      DistanceFromHome:         'Distance domicile',
      MonthlyRate:              'Taux mensuel',
      TotalWorkingYears:        'Années d\'expérience totale',
    };
    return map[feature] ?? feature;
  }

  // ── Risk helpers ──
  getRiskColor(level: string): string {
    switch (level) {
      case 'ÉLEVÉ': return 'warn';
      case 'MOYEN': return 'accent';
      default:      return 'primary';
    }
  }

  getRiskIcon(level: string): string {
    switch (level) {
      case 'ÉLEVÉ':  return 'dangerous';
      case 'MOYEN':  return 'warning';
      case 'FAIBLE': return 'check_circle';
      default:       return 'help_outline';
    }
  }

  getShapColor(impact: string): string {
    return impact === 'AUGMENTE' ? '#D40000' : '#2e7d32';
  }

  getShapTotal(): number {
    return this.getFacteurs().reduce((sum, f) => sum + Math.abs(f.shap_value), 0);
  }

  getShapPercent(value: number): number {
    const total = this.getShapTotal();
    return total === 0 ? 0 : Math.round((Math.abs(value) / total) * 100);
  }

  getShapWidth(value: number): number {
    return this.getShapPercent(value);
  }

  // ── Navigation ──
  launchPrediction(): void {
    if (!this.employee?.id) return;
    this.snackBar.open('Prédiction en cours...', '', { duration: 2000 });
    this.employeeService.predict(this.employee.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Prédiction effectuée !', 'Fermer', { duration: 3000 });
        this.loadData(this.employee!.id!);
      },
      error: () => this.snackBar.open('❌ Erreur prédiction', 'Fermer', { duration: 3000 })
    });
  }

  goToSimulation(): void {
    this.router.navigate(['/simulation'], { queryParams: { employeeId: this.employee?.id } });
  }

  goToHistorique(): void {
    this.router.navigate(['/employees', this.employee?.id, 'historique']);
  }
}
