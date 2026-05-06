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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../shared/models/employee.model';

export interface ScoreHistory {
  id: number;
  employeeId: number;
  employeeNom: string;
  employeeMatricule: string;
  probabilite: number;
  niveauRisque: string;
  seuilUtilise: number;
  facteursPrincipaux?: string;
  recommandations?: string;
  dateCalcul: string;
  modelVersion?: string;
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
    MatTableModule
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss'
})
export class EmployeeDetailComponent implements OnInit {

  employee: Employee | null = null;
  loading = true;

  // Historique scores
  historiqueScores: ScoreHistory[] = [];
  historiqueDataSource = new MatTableDataSource<ScoreHistory>([]);
  displayedColumnsHistory = ['date', 'probabilite', 'niveauRisque'];

  // Recommandations
  recommandations: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadEmployee(id);
      this.loadHistory(id);
      this.loadRecommendations(id);  // ← AJOUTE L'ID ICI
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

  loadHistory(id: number): void {
    this.employeeService.getScoreHistory(id).subscribe({
      next: (data: ScoreHistory[]) => {
        this.historiqueScores = data;
        this.historiqueDataSource.data = data;
      },
      error: (err) => {
        console.error('Erreur chargement historique:', err);
      }
    });
  }

  loadRecommendations(employeeId: number): void {
    this.employeeService.getRecommendationsForEmployee(employeeId).subscribe({
      next: (data: any) => {
        if (data?.recommendations && data.recommendations.length > 0) {
          this.recommandations = data.recommendations;
          console.log('✅ Recommandations chargées:', this.recommandations);
        } else {
          this.recommandations = ['📈 Suivi mensuel recommandé', '🎓 Évaluation des compétences'];
        }
      },
      error: (err) => {
        console.error('❌ Erreur chargement recommandations:', err);
        this.recommandations = ['📈 Suivi mensuel recommandé', '🎓 Évaluation des compétences'];
      }
    });
  }

  getRiskLevel(score: number | undefined): string {
    if (!score && score !== 0) return 'NON ÉVALUÉ';
    if (score >= 0.85) return 'ÉLEVÉ';
    if (score >= 0.76) return 'MOYEN';
    return 'FAIBLE';
  }

  getRiskColor(level: string): string {
    switch (level) {
      case 'ÉLEVÉ': return 'warn';
      case 'MOYEN': return 'accent';
      default: return 'primary';
    }
  }

  getRiskIcon(level: string): string {
    switch (level) {
      case 'ÉLEVÉ': return 'dangerous';
      case 'MOYEN': return 'warning';
      default: return 'check_circle';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  }

  goToSimulation(): void {
    this.router.navigate(['/simulation'], { queryParams: { employeeId: this.employee?.id } });
  }

  launchPrediction(): void {
    if (!this.employee?.id) return;
    this.snackBar.open('Prédiction en cours...', '', { duration: 2000 });
    this.employeeService.predict(this.employee.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Prédiction effectuée !', 'Fermer', { duration: 3000 });
        this.loadEmployee(this.employee!.id!);
        this.loadHistory(this.employee!.id!);
      },
      error: () => {
        this.snackBar.open('❌ Erreur prédiction', 'Fermer', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }

  viewAllRecommendations(): void {
    this.router.navigate(['/recommandations'], { queryParams: { employeeId: this.employee?.id } });
  }
}
