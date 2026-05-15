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
import { MatDividerModule } from '@angular/material/divider';
import Swal from 'sweetalert2';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    MatDividerModule,
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

  isManager = false;
  managerDepartement = '';

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
    private dialog: MatDialog,
    private authService: AuthService

  ) {}

  ngOnInit(): void {
    this.isManager = this.authService.getRole() === 'ROLE_MANAGER';
    this.managerDepartement = this.authService.getDepartement() || '';

    if (this.isManager) {
      this.displayedColumns = [
        'matricule', 'nom',
        'poste', 'risque', 'probabilite'  // ← 'departement' supprimé
      ];
    }

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

        // ← filtre automatique si manager
        if (this.isManager) {
          this.employees = data.filter(e => e.department === this.managerDepartement);
        }

        this.dataSource.data = this.employees;
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
    Swal.fire({
      title: 'Prédiction Batch',
      text: 'Voulez-vous lancer la prédiction pour tous les employés ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, lancer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#757575',
      reverseButtons: true
    }).then((result) => {
      if (!result.isConfirmed) return;

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
            Swal.fire({
              title: 'Batch terminé !',
              text: `${response.successCount} employé(s) traité(s) avec succès.`,
              icon: 'success',
              confirmButtonColor: '#1976d2',
              timer: 4000,
              timerProgressBar: true
            });
          } else {
            Swal.fire({
              title: 'Batch terminé avec avertissements',
              html: `✅ <b>${response.successCount}</b> succès<br>❌ <b>${response.failedCount}</b> échec(s)`,
              icon: 'warning',
              confirmButtonColor: '#1976d2'
            });
          }
        },
        error: (err) => {
          this.batchInProgress = false;
          console.error('Erreur batch:', err);
          Swal.fire({
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la prédiction batch.',
            icon: 'error',
            confirmButtonColor: '#1976d2'
          });
        }
      });
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
      'DIRECTION_GENERALE':                  'Dir. Générale',
      'DIRECTION_RESSOURCES_HUMAINES':       'Ressources Humaines',
      'DIRECTION_ADMINISTRATIVE_FINANCIERE': 'Admin. & Finance',
      'DIRECTION_JURIDIQUE':                 'Juridique',
      'DIRECTION_TECHNOLOGIQUE':             'Technologie',
      'DIRECTION_RELATIONS_OPERATEURS':      'Relations Opérateurs',
      'DIRECTION_SERVICE_CLIENT':            'Service Client',
    };
    return map[dept] ?? dept
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }




  formatPoste(poste: string): string {
    const map: { [key: string]: string } = {
      'DIRECTEUR_GENERAL':          'Directeur Général',
      'ASSISTANT_DIRECTION':        'Assistant de Direction',
      'RESPONSABLE_RH':             'Responsable RH',
      'CHARGE_RECRUTEMENT':         'Chargé de Recrutement',
      'CHARGE_FORMATION':           'Chargé de Formation',
      'DIRECTEUR_FINANCIER':        'Directeur Financier',
      'COMPTABLE':                  'Comptable',
      'CONTROLEUR_GESTION':         'Contrôleur de Gestion',
      'DIRECTEUR_JURIDIQUE':        'Directeur Juridique',
      'JURISTE':                    'Juriste',
      'CONSEILLER_JURIDIQUE':       'Conseiller Juridique',
      'DIRECTEUR_TECHNIQUE':        'Directeur Technique',
      'ARCHITECTE_SYSTEME':         'Architecte Système',
      'INGENIEUR_RESEAU':           'Ingénieur Réseau',
      'INGENIEUR_TELECOM':          'Ingénieur Télécom',
      'TECHNICIEN_RESEAU':          'Technicien Réseau',
      'DIRECTEUR_SI':               'Directeur SI',
      'DEVELOPPEUR':                'Développeur',
      'ANALYSTE_SYSTEME':           'Analyste Système',
      'ADMINISTRATEUR_SYSTEME':     'Administrateur Système',
      'DATA_ENGINEER':              'Data Engineer',
      'DATA_ANALYST':               'Data Analyst',
      'DIRECTEUR_COMMERCIAL':       'Directeur Commercial',
      'RESPONSABLE_COMMERCIAL':     'Responsable Commercial',
      'COMMERCIAL':                 'Commercial',
      'CHARGE_MARKETING':           'Chargé Marketing',
      'DIRECTEUR_SERVICE_CLIENT':   'Directeur Service Client',
      'RESPONSABLE_SERVICE_CLIENT': 'Responsable Service Client',
      'CONSEILLER_CLIENT':          'Conseiller Client',
      'SUPERVISEUR_CENTRE_APPEL':   'Superviseur Centre d\'Appel',
    };
    return map[poste] ?? poste
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}
