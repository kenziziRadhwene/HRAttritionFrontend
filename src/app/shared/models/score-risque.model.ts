export interface ScoreRisque {
  id: number;
  employeeId: number;
  employeeNom: string;
  employeeMatricule: string;
  probabilite: number;
  niveauRisque: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ';
  seuilUtilise: number;
  facteursPrincipaux: string;
  recommandations: string;
  dateCalcul: string;
  modelVersion: string;
}

export interface FacteurRisque {
  feature: string;
  shap_value: number;
  impact: 'AUGMENTE' | 'DIMINUE';
}
