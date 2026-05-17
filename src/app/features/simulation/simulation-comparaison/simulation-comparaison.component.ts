import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { SimulationService } from '../../../core/services/simulation.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service'; // ← AJOUT
import { Employee } from '../../../shared/models/employee.model';
import {
  ComparaisonSimulation,
  SimulationResponse
} from '../../../shared/models/simulation.model';

@Component({
  selector: 'app-simulation-comparaison',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './simulation-comparaison.component.html',
  styleUrl: './simulation-comparaison.component.scss'
})
export class SimulationComparaisonComponent implements OnInit {

  employee: Employee | null = null;
  comparaison: ComparaisonSimulation | null = null;
  loading = false;

  constructor(
    private simulationService: SimulationService,
    private employeeService: EmployeeService,
    private breadcrumbService: BreadcrumbService, // ← AJOUT
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParams['employeeId'];

    if (!id) {
      this.router.navigate(['/employees']);
      return;
    }

    this.employeeService.getById(+id).subscribe({
      next: (emp) => {
        this.employee = emp;
        this.loading = false;

        // ── AJOUT : injecter le nom de l'employé dans le breadcrumb ──
        // Remplace le segment "simulation" par le vrai chemin :
        // Accueil > Employés > Jean Dupont > Simulation des décisions RH
        this.breadcrumbService.setSegmentOverride('employees', {
          label: 'Employés',
          url: '/employees',
          icon: 'people'
        });

        this.breadcrumbService.setSegmentOverride('simulation', {
          label: `${emp.firstName} ${emp.lastName}`,
          url: `/employees`,
          icon: 'person'
        });
        // ─────────────────────────────────────────────────────────────
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Employé introuvable', 'Fermer', { duration: 3000 });
        this.router.navigate(['/employees']);
      }
    });
  }

  lancerSimulation(id: number): void {
    this.loading = true;
    this.comparaison = null;

    this.simulationService.comparerScenarios(id).subscribe({
      next: (data) => {
        this.comparaison = data;
        this.loading = false;
        this.snackBar.open('✅ Simulation terminée !', 'Fermer', { duration: 2000 });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('❌ Erreur simulation', 'Fermer', { duration: 3000 });
      }
    });
  }

  getImpactColor(impact: number): string {
    if (impact > 0.05) return 'primary';
    if (impact > 0)    return 'accent';
    return 'warn';
  }

  getImpactIcon(impact: number): string {
    if (impact > 0.05) return 'trending_down';
    if (impact > 0)    return 'trending_flat';
    return 'trending_up';
  }

  getRisqueColor(niveau: string): string {
    switch (niveau) {
      case 'ÉLEVÉ': return 'warn';
      case 'MOYEN': return 'accent';
      default:      return 'primary';
    }
  }

  getImpactPct(impact: number): string {
    return (impact * 100).toFixed(2) + '%';
  }

  isMeilleure(type: string): boolean {
    return this.comparaison?.typeSimulationRecommande === type;
  }

  isMeilleureSalaire(sim: SimulationResponse): boolean {
    return this.comparaison?.typeSimulationRecommande === 'AUGMENTATION_SALAIRE'
      && sim.impactPourcentage === this.comparaison?.meilleurImpact;
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }
}
