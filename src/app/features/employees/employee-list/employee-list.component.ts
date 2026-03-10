import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../shared/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit {

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading = true;
  searchText = '';

  displayedColumns = [
    'matricule', 'nom', 'departement',
    'poste', 'risque', 'probabilite', 'actions'
  ];

  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur chargement employés', 'Fermer', { duration: 3000 });
      }
    });
  }

  search(): void {
    const term = this.searchText.toLowerCase();
    this.filteredEmployees = this.employees.filter(e =>
      e.firstName.toLowerCase().includes(term) ||
      e.lastName.toLowerCase().includes(term) ||
      e.matricule.toLowerCase().includes(term) ||
      e.department.toLowerCase().includes(term)
    );
  }

  predict(employee: Employee): void {
    this.snackBar.open('Prédiction en cours...', '', { duration: 2000 });
    this.employeeService.predict(employee.id!).subscribe({
      next: () => {
        this.snackBar.open('✅ Prédiction effectuée !', 'Fermer', { duration: 3000 });
        this.loadEmployees();
      },
      error: () => {
        this.snackBar.open('❌ Erreur prédiction', 'Fermer', { duration: 3000 });
      }
    });
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

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
