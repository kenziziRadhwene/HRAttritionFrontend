import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { AlerteService } from '../../../core/services/alerte.service';
import { Alerte } from '../../../shared/models/alerte.model';

@Component({
  selector: 'app-alerte-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './alerte-list.component.html',
  styleUrl: './alerte-list.component.scss'
})
export class AlerteListComponent implements OnInit {

  alertes: Alerte[] = [];
  alertesNonLues: Alerte[] = [];
  loading = true;

  displayedColumns = [
    'statut', 'titre', 'employe',
    'probabilite', 'email', 'date', 'actions'
  ];

  constructor(
    private alerteService: AlerteService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAlertes();
  }

  loadAlertes(): void {
    this.loading = true;
    this.alerteService.getAll().subscribe({
      next: (data) => {
        this.alertes = data;
        this.alertesNonLues = data.filter(a => a.statut === 'NON_LUE');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur chargement alertes', 'Fermer', { duration: 3000 });
      }
    });
  }

  marquerLue(alerte: Alerte): void {
    this.alerteService.marquerLue(alerte.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Alerte marquée comme lue', 'Fermer', { duration: 2000 });
        this.loadAlertes();
      }
    });
  }

  marquerTraitee(alerte: Alerte): void {
    this.alerteService.marquerTraitee(alerte.id).subscribe({
      next: () => {
        this.snackBar.open('✅ Alerte marquée comme traitée', 'Fermer', { duration: 2000 });
        this.loadAlertes();
      }
    });
  }

  getStatutColor(statut: string): string {
    switch (statut) {
      case 'NON_LUE':  return 'warn';
      case 'LUE':      return 'accent';
      case 'TRAITEE':  return 'primary';
      default:         return '';
    }
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'NON_LUE':  return 'mark_email_unread';
      case 'LUE':      return 'mark_email_read';
      case 'TRAITEE':  return 'task_alt';
      default:         return 'archive';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
