import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { EmployeeService } from '../../../core/services/employee.service';
import { ScoreRisqueService } from '../../../core/services/score-risque.service';
import { Employee } from '../../../shared/models/employee.model';
import { ScoreRisque, FacteurRisque } from '../../../shared/models/score-risque.model';
import { Pipe, PipeTransform } from '@angular/core';

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
    MatToolbarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTableModule,
    FormatEnumPipe,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss'
})
export class EmployeeDetailComponent implements OnInit {

  employee: Employee | null = null;
  latestScore: ScoreRisque | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private scoreRisqueService: ScoreRisqueService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    if (id) {
      this.loadEmployee(id);
      this.loadLatestScore(id);
    }
  }

  loadEmployee(id: number): void {
    this.loading = true;
    this.employeeService.getById(id).subscribe({
      next: (data) => {
        this.employee = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur chargement employé', 'Fermer', { duration: 3000 });
        this.router.navigate(['/employees']);
      }
    });
  }

  loadLatestScore(id: number): void {
    this.scoreRisqueService.getHistorique(id).subscribe({
      next: (data: ScoreRisque[]) => {
        if (data && data.length > 0) {
          // Prendre le score le plus récent
          this.latestScore = data.sort((a, b) =>
            new Date(b.dateCalcul).getTime() - new Date(a.dateCalcul).getTime()
          )[0];
        }
      },
      error: (err) => console.error('Erreur chargement score:', err)
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
      { label: 'Satisfaction au travail',     value: this.employee.jobSatisfaction },
      { label: 'Satisfaction environnement',  value: this.employee.environmentSatisfaction },
      { label: 'Satisfaction relations',      value: this.employee.relationshipSatisfaction },
      { label: 'Implication au travail',      value: this.employee.jobInvolvement },
      { label: 'Équilibre vie pro/perso',     value: this.employee.workLifeBalance },
      { label: 'Performance',                 value: this.employee.performanceRating },
    ];
  }

  // ── Formatage ──
  formatMarital(val: string): string {
    switch (val) {
      case 'Single':   return 'Célibataire';
      case 'Married':  return 'Marié(e)';
      case 'Divorced': return 'Divorcé(e)';
      default:         return val;
    }
  }

  formatEducation(val: number): string {
    switch (val) {
      case 1: return 'Bac';
      case 2: return 'Bac+2';
      case 3: return 'Licence';
      case 4: return 'Master';
      case 5: return 'Doctorat';
      default: return `Niveau ${val}`;
    }
  }

  formatTravel(val: string): string {
    switch (val) {
      case 'Non-Travel':        return 'Aucun déplacement';
      case 'Travel_Rarely':     return 'Rarement';
      case 'Travel_Frequently': return 'Fréquemment';
      default:                  return val;
    }
  }

  formatFeature(feature: string): string {
    const map: { [key: string]: string } = {
      'JobSatisfaction':           'Satisfaction au travail',
      'tenure_category':           'Catégorie ancienneté',
      'overtime_x_joblevel':       'Heures sup × Niveau poste',
      'WorkLifeBalance':           'Équilibre vie pro/perso',
      'EnvironmentSatisfaction':   'Satisfaction environnement',
      'JobInvolvement':            'Implication au travail',
      'YearsAtCompany':            'Années dans l\'entreprise',
      'Age':                       'Âge',
      'tenure_satisfaction':       'Ancienneté × Satisfaction',
      'NumCompaniesWorked':        'Nombre d\'entreprises',
      'MonthlyIncome':             'Salaire mensuel',
      'StockOptionLevel':          'Options sur actions',
      'satisfaction_score':        'Score satisfaction global',
      'promotion_rate':            'Taux de promotion',
      'YearsSinceLastPromotion':   'Depuis dernière promotion',
      'YearsWithCurrManager':      'Années avec manager actuel',
      'job_hopping_score':         'Score mobilité entreprises',
      'work_life_balance_score':   'Score équilibre vie',
      'DistanceFromHome':          'Distance domicile',
      'MonthlyRate': 'Taux mensuel',
      'TotalWorkingYears':         'Années d\'expérience totale',
    };
    return map[feature] || feature;
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
      case 'ÉLEVÉ': return 'dangerous';
      case 'MOYEN': return 'warning';
      case 'FAIBLE': return 'check_circle';
      default:       return 'help_outline';
    }
  }

  getShapColor(impact: string): string {
    return impact === 'AUGMENTE' ? '#D40000' : '#2e7d32';
  }

  getShapTotal(): number {
    const facteurs = this.getFacteurs();
    return facteurs.reduce((sum, f) => sum + Math.abs(f.shap_value), 0);
  }

  getShapPercent(value: number): number {
    const total = this.getShapTotal();
    if (total === 0) return 0;
    return Math.round((Math.abs(value) / total) * 100);
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
        this.loadEmployee(this.employee!.id!);
        this.loadLatestScore(this.employee!.id!);
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

  goBack(): void {
    this.router.navigate(['/employees']);
  }



}
