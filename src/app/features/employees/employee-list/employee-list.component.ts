import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../shared/models/employee.model';
import { BatchReportDialogComponent, BatchReportData } from '../batch-report-dialog/batch-report-dialog.component';

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
    MatSnackBarModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit, AfterViewInit {

  employees: Employee[] = [];
  dataSource = new MatTableDataSource<Employee>([]);
  loading = true;

  // Filtres
  searchText = '';
  selectedDepartment = '';
  selectedRiskLevel = '';

  // Options filtres
  departments: string[] = [];
  riskLevels = ['FAIBLE', 'MOYEN', 'ÉLEVÉ'];

  // ── Colonne 'anciennete' supprimée ──
  displayedColumns = [
    'matricule', 'nom', 'departement',
    'poste', 'risque', 'probabilite', 'actions'
  ];

  batchInProgress = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
        this.dataSource.data = data;
        this.extractDepartments();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur chargement employés', 'Fermer', { duration: 3000 });
      }
    });
  }

  extractDepartments(): void {
    const depts = new Set(this.employees.map(e => e.department));
    this.departments = Array.from(depts).sort();
  }

  applyFilters(): void {
    let filtered = [...this.employees];

    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      filtered = filtered.filter(e =>
        e.firstName.toLowerCase().includes(term) ||
        e.lastName.toLowerCase().includes(term) ||
        e.matricule.toLowerCase().includes(term) ||
        e.department.toLowerCase().includes(term)
      );
    }

    if (this.selectedDepartment) {
      filtered = filtered.filter(e => e.department === this.selectedDepartment);
    }

    if (this.selectedRiskLevel) {
      filtered = filtered.filter(e => e.dernierNiveauRisque === this.selectedRiskLevel);
    }

    this.dataSource.data = filtered;
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedDepartment = '';
    this.selectedRiskLevel = '';
    this.dataSource.data = this.employees;
  }

  predict(employee: Employee, event: Event): void {
    event.stopPropagation();
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

  openBatchPredictionDialog(): void {
    this.batchInProgress = true;
    const snackBarRef = this.snackBar.open('🚀 Lancement de la prédiction batch...', '', { duration: 3000 });

    this.employeeService.predictAll().subscribe({
      next: (response: BatchReportData) => {
        this.batchInProgress = false;
        snackBarRef.dismiss();

        this.dialog.open(BatchReportDialogComponent, {
          width: '600px',
          data: response
        });

        this.loadEmployees();

        if (response.failedCount === 0) {
          this.snackBar.open('✅ Batch terminé avec succès !', 'Fermer', { duration: 5000 });
        } else {
          this.snackBar.open(`⚠️ Batch terminé: ${response.successCount} succès, ${response.failedCount} échecs`, 'Fermer', { duration: 5000 });
        }
      },
      error: (err) => {
        this.batchInProgress = false;
        console.error('Erreur batch:', err);
        this.snackBar.open('❌ Erreur lors de la prédiction batch', 'Fermer', { duration: 5000 });
      }
    });
  }

  viewEmployeeDetail(employee: Employee): void {
    this.router.navigate(['/employees', employee.id]);
  }

  goToImport(): void {
    this.router.navigate(['/employees/import']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
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

  getAnciennete(employee: Employee): number {
    return employee.yearsAtCompany || 0;
  }

  // ── Raccourcissement des noms de département ──
  formatDept(dept: string): string {
    const map: { [key: string]: string } = {
      'Research & Development': 'R&D',
      'Sales':                  'Ventes',
      'Human Resources':        'RH',
      'Information Technology': 'IT',
      'Finance':                'Finance',
      'Marketing':              'Mktg',
      'Operations':             'Opérat.',
      'Legal':                  'Juridique',
      'Customer Service':       'Client',
      'Engineering':            'Ingén.',
    };
    return map[dept] ?? dept;
  }
}
