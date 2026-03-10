export interface ScoreRisque {
  id: number;
  probabilite: number;
  niveauRisque: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ';
  seuilUtilise: number;
  facteursPrincipaux: string;
  recommandations: string;
  dateCalcul: string;
  modelVersion: string;
}
