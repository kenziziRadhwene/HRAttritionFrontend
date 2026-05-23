import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmployeeService } from '../../../core/services/employee.service';
import { FormatDialogComponent } from './format-dialog/format-dialog.component';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './import.component.html',
  styleUrl: './import.component.scss'
})
export class ImportComponent {

  // État
  selectedFile: File | null = null;
  isDragOver = false;
  loading = false;
  result: any = null;

  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  // ── Drag & Drop ──────────────────────
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.validateAndSetFile(file);
  }

  // ── Sélection fichier ─────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  validateAndSetFile(file: File): void {
    const validTypes = ['text/csv', 'application/vnd.ms-excel'];
    const validExt   = file.name.endsWith('.csv') || file.name.endsWith('.xlsx');

    if (!validTypes.includes(file.type) && !validExt) {
      this.snackBar.open(
        '❌ Format invalide. Veuillez sélectionner un fichier CSV.',
        'Fermer', { duration: 3000 });
      return;
    }

    this.selectedFile = file;
    this.result = null;
  }

  getFileSize(): string {
    if (!this.selectedFile) return '';
    const size = this.selectedFile.size;
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ── Import ────────────────────────────
  lancerImport(): void {
    if (!this.selectedFile) return;

    this.loading = true;
    this.result  = null;

    this.employeeService.importCsv(this.selectedFile).subscribe({
      next: (data) => {
        this.result  = data;
        this.loading = false;
        if (data.erreurs === 0) {
          this.snackBar.open(
            `✅ Import terminé ! ${data.crees} créés, ${data.misAJour} mis à jour.`,
            'Fermer', { duration: 4000 });
        } else {
          this.snackBar.open(
            `⚠️ Import terminé avec ${data.erreurs} erreur(s).`,
            'Fermer', { duration: 4000 });
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open(
          '❌ Erreur lors de l\'import. Vérifiez votre fichier.',
          'Fermer', { duration: 4000 });
      }
    });
  }

  // ── Format Dialog ─────────────────────
  voirFormat(): void {
    this.dialog.open(FormatDialogComponent, {
      width: '560px',
      panelClass: 'format-dialog'
    });
  }

  // ── Télécharger le modèle ─────────────
  telechargerModele(): void {
    const headers = [
      'EmployeeNumber', 'Age', 'Gender', 'MaritalStatus', 'Department',
      'JobRole', 'JobLevel', 'BusinessTravel', 'MonthlyIncome', 'OverTime',
      'YearsAtCompany', 'JobSatisfaction', 'WorkLifeBalance',
      'PerformanceRating', 'EnvironmentSatisfaction', 'RelationshipSatisfaction'
    ].join(',');

    const blob = new Blob([headers + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'modele_import_rh.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Réinitialiser ─────────────────────
  reinitialiser(): void {
    this.selectedFile = null;
    this.result       = null;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
