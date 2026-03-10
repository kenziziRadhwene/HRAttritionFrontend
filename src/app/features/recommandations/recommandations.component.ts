import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ScoreRisqueService } from '../../core/services/score-risque.service';
import { ScoreRisque, FacteurRisque } from '../../shared/models/score-risque.model';

@Component({
  selector: 'app-recommandations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './recommandations.component.html',
  styleUrl: './recommandations.component.scss'
})
export class RecommandationsComponent implements OnInit {

  scores: ScoreRisque[] = [];
  loading = true;

  constructor(
    private scoreRisqueService: ScoreRisqueService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecommandations();
  }

  loadRecommandations(): void {
    this.loading = true;
    this.scoreRisqueService.getRecommandations().subscribe({
      next: (data) => {
        this.scores = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur chargement recommandations', 'Fermer', { duration: 3000 });
      }
    });
  }

  getFacteurs(score: ScoreRisque): FacteurRisque[] {
    try {
      return JSON.parse(score.facteursPrincipaux);
    } catch {
      return [];
    }
  }

  getRecommandationsList(score: ScoreRisque): string[] {
    try {
      return JSON.parse(score.recommandations);
    } catch {
      return [];
    }
  }

  getRisqueColor(niveau: string): string {
    switch (niveau) {
      case 'ÉLEVÉ': return 'warn';
      case 'MOYEN': return 'accent';
      default:      return 'primary';
    }
  }

  getShapColor(impact: string): string {
    return impact === 'AUGMENTE' ? '#c62828' : '#2e7d32';
  }

  getShapIcon(impact: string): string {
    return impact === 'AUGMENTE' ? 'trending_up' : 'trending_down';
  }

  getShapWidth(value: number): number {
    return Math.min(Math.abs(value) * 60, 100);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
