import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface BatchReportData {
  successCount: number;
  failedCount: number;
  totalEmployees: number;
  durationMs: number;
  errors: string[];
}

@Component({
  selector: 'app-batch-report-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>fact_check</mat-icon>
      Rapport de prédiction batch
    </h2>
    <mat-dialog-content class="dialog-content">
      <div class="stats-grid">
        <div class="stat-card success">
          <mat-icon>check_circle</mat-icon>
          <div class="stat-value">{{ data.successCount }}</div>
          <div class="stat-label">Succès</div>
        </div>
        <div class="stat-card failed">
          <mat-icon>error</mat-icon>
          <div class="stat-value">{{ data.failedCount }}</div>
          <div class="stat-label">Échecs</div>
        </div>
        <div class="stat-card total">
          <mat-icon>people</mat-icon>
          <div class="stat-value">{{ data.totalEmployees }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card duration">
          <mat-icon>schedule</mat-icon>
          <div class="stat-value">{{ data.durationMs / 1000 | number:'1.1-1' }}s</div>
          <div class="stat-label">Durée</div>
        </div>
      </div>

      <div *ngIf="data.errors && data.errors.length > 0" class="errors-section">
        <mat-icon>warning</mat-icon>
        <span class="errors-title">Erreurs détectées ({{ data.errors.length }})</span>
        <div class="errors-list">
          <div *ngFor="let error of data.errors" class="error-item">
            <mat-icon>error_outline</mat-icon>
            <span>{{ error }}</span>
          </div>
        </div>
      </div>

      <div *ngIf="data.failedCount === 0 && data.successCount > 0" class="success-message">
        <mat-icon>celebration</mat-icon>
        <span>Tous les employés ont été prédits avec succès !</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="close()">
        <mat-icon>close</mat-icon>
        Fermer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #D40000;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin: 20px 0;
    }
    .stat-card {
      text-align: center;
      padding: 16px;
      border-radius: 8px;
      background: #f5f5f5;
    }
    .stat-card.success { background: #e8f5e9; color: #2e7d32; }
    .stat-card.failed { background: #ffebee; color: #c62828; }
    .stat-card.total { background: #e3f2fd; color: #1565c0; }
    .stat-card.duration { background: #fff3e0; color: #ef6c00; }
    .stat-card mat-icon { font-size: 32px; width: 32px; height: 32px; margin-bottom: 8px; }
    .stat-value { font-size: 28px; font-weight: bold; }
    .stat-label { font-size: 12px; margin-top: 4px; opacity: 0.8; }
    .errors-section { margin-top: 20px; }
    .errors-title { font-weight: bold; margin-left: 8px; }
    .errors-list { max-height: 200px; overflow-y: auto; margin-top: 12px; }
    .error-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 12px; color: #c62828; }
    .success-message { display: flex; align-items: center; gap: 8px; padding: 16px; background: #e8f5e9; border-radius: 8px; margin-top: 16px; color: #2e7d32; }
  `]
})
export class BatchReportDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BatchReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BatchReportData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
