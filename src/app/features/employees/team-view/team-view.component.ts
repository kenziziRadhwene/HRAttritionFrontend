import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../shared/models/employee.model';

@Component({
  selector: 'app-team-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatSnackBarModule
  ],
  templateUrl: './team-view.component.html',
  styleUrl: './team-view.component.scss'
})
export class TeamViewComponent implements OnInit {

  // Départements disponibles
  departements = [
    'DIRECTION_GENERALE',
    'DIRECTION_RESSOURCES_HUMAINES',
    'DIRECTION_ADMINISTRATIVE_FINANCIERE',
    'DIRECTION_JURIDIQUE',
    'DIRECTION_TECHNOLOGIQUE',
    'DIRECTION_RELATIONS_OPERATEURS',
    'DIRECTION_COMMERCIALE',
    'DIRECTION_SERVICE_CLIENT',
    'DIRECTION_SYSTEMES_INFORMATION',
    'DIRECTION_OPERATIONS',
    'DIRECTION_TECHNIQUE_FIXE',
    'DIRECTION_INGENIERIE_RESEAUX',
    'DEPARTEMENT_PERFORMANCE_RESEAUX',
    'SERVICE_APPLICATION_VENTE',
    'SERVICE_DATA_ENGINEERING',
    'SERVICE_DASHBOARD_DATA_MINING'
  ];

  selectedDepartement = '';
  employees: Employee[] = [];
  loading = false;

  displayedColumns = [
    'matricule', 'nom', 'poste',
    'risque', 'probabilite', 'satisfaction'
  ];

  // Stats équipe
  get totalEquipe(): number { return this.employees.length; }
  get risqueEleve(): number {
    return this.employees.filter(e => e.dernierNiveauRisque === 'ÉLEVÉ').length;
  }
  get risqueMoyen(): number {
    return this.employees.filter(e => e.dernierNiveauRisque === 'MOYEN').length;
  }
  get risqueFaible(): number {
    return this.employees.filter(e => e.dernierNiveauRisque === 'FAIBLE').length;
  }

  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {}

  chargerEquipe(): void {
    if (!this.selectedDepartement) return;

    this.loading = true;
    this.employees = [];

    this.employeeService.getByDepartment(this.selectedDepartement).subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
        this.snackBar.open(
          `✅ ${data.length} employé(s) trouvé(s)`,
          'Fermer',
          { duration: 2000 }
        );
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur chargement équipe', 'Fermer', { duration: 3000 });
      }
    });
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

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
