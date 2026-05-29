// src/app/features/audit-logs/audit-log-list/audit-log-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { AuditLogService } from '../../../core/services/audit-log.service';
import { AuditLog, AuditLogPage } from '../../../shared/models/audit-log.model';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './audit-log-list.component.html',
  styleUrl: './audit-log-list.component.scss'
})
export class AuditLogListComponent implements OnInit, OnDestroy {

  logs: AuditLog[] = [];
  loading = true;
  error   = false;

  // Colonnes du mat-table
  displayedColumns: string[] = ['index', 'date', 'utilisateur', 'role', 'action', 'details', 'ipAddress'];

  // Pagination
  currentPage   = 0;
  pageSize      = 20;
  totalElements = 0;
  totalPages    = 0;

  // Filtres
  searchQuery    = '';
  selectedRole   = '';
  selectedAction = '';

  private searchSubject = new Subject<string>();
  private destroy$      = new Subject<void>();

  // ─── Libellés ───────────────────────────────────────────────
  readonly ROLE_LABELS: Record<string, string> = {
    ADMIN:          'Administrateur',
    RESPONSABLE_RH: 'Responsable RH',
    MANAGER:        'Manager'
  };

  readonly ACTION_LABELS: Record<string, string> = {
    LOGIN:                        'Connexion',
    LOGOUT:                       'Déconnexion',
    USER_CREATE:                  'Création utilisateur',
    USER_UPDATE:                  'Modification utilisateur',
    USER_DELETE:                  'Suppression utilisateur',
    PROFILE_UPDATE:               'Mise à jour profil',
    EMPLOYEE_CREATE:              'Ajout employé',
    EMPLOYEE_UPDATE:              'Modification employé',
    EMPLOYEE_DELETE:              'Suppression employé',
    EMPLOYEE_IMPORT:              'Import employés',
    PREDICTION_INDIVIDUELLE:      'Prédiction individuelle',
    PREDICTION_BATCH:             'Prédiction batch',
    PREDICTION_BATCH_DEPARTEMENT: 'Prédiction batch département',
    SIMULATION_SALAIRE:           'Simulation salaire',
    SIMULATION_POSTE:             'Simulation poste',
    SIMULATION_FORMATION:         'Simulation formation'
  };

  readonly ROLES   = Object.keys(this.ROLE_LABELS);
  readonly ACTIONS = Object.keys(this.ACTION_LABELS);

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadLogs();
    });

    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLogs(): void {
    this.loading = true;
    this.error   = false;

    this.auditLogService.getLogs(
      this.currentPage,
      this.pageSize,
      this.searchQuery,
      this.selectedRole,
      this.selectedAction
    ).subscribe({
      next: (page: AuditLogPage) => {
        this.logs          = page.content       ?? [];
        this.totalElements = page.totalElements ?? 0;
        this.totalPages    = page.totalPages    ?? 1;
        this.loading       = false;
      },
      error: () => {
        this.loading = false;
        this.error   = true;
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadLogs();
  }

  resetFilters(): void {
    this.searchQuery    = '';
    this.selectedRole   = '';
    this.selectedAction = '';
    this.currentPage    = 0;
    this.loadLogs();
  }

  /** Appelé par le mat-paginator */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize    = event.pageSize;
    this.loadLogs();
  }

  // ─── Helpers template ───────────────────────────────────────
  getRoleLabel(role: string): string {
    return this.ROLE_LABELS[role] ?? role;
  }

  getActionLabel(action: string): string {
    return this.ACTION_LABELS[action] ?? action;
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      ADMIN:          'badge-admin',
      RESPONSABLE_RH: 'badge-rh',
      MANAGER:        'badge-manager'
    };
    return map[role] ?? 'badge-default';
  }

  getActionBadgeClass(action: string): string {
    if (action.includes('DELETE'))                               return 'badge-danger';
    if (action.includes('CREATE'))                               return 'badge-success';
    if (action.includes('UPDATE') || action.includes('IMPORT'))  return 'badge-warning';
    if (action === 'LOGIN' || action === 'LOGOUT')               return 'badge-info';
    return 'badge-default';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  get startIndex(): number { return this.currentPage * this.pageSize + 1; }
  get endIndex():   number { return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements); }
}
