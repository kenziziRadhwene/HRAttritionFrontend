export interface DashboardStats {
  totalEmployes: number;
  totalActifs: number;
  totalAlertes: number;
  alertesNonLues: number;
  totalPredictions: number;

  // Répartition par risque
  risqueEleve: number;
  risqueMoyen: number;
  risqueFaible: number;
  tauxRisqueEleve: number;

  // Répartition par département (existant)
  repartitionDepartement: { [key: string]: number };

  // NOUVEAU — Répartition risque détaillée par département
  repartitionRisqueParDepartement: {
    [departement: string]: {
      'ÉLEVÉ': number;
      'MOYEN': number;
      'FAIBLE': number;
    }
  };

  // NOUVEAU — Taux de turnover prédit par département (%)
  tauxTurnoverParDepartement: { [departement: string]: number };

  // NOUVEAU — Top facteurs de risque globaux
  topFacteursRisque: FacteurRisqueGlobal[];

  // Top 5 employés à risque
  top5Risque: EmployeeRisque[];
}

export interface EmployeeRisque {
  id: number;
  nom: string;
  matricule: string;
  departement: string;
  probabilite: number;
  niveauRisque: string;
}

export interface FacteurRisqueGlobal {
  feature: string;
  featureLabel: string;
  count: number;
  avgShapValue: number;
  pourcentage: number;
}


export interface EvolutionMensuelle {
  mois: string;
  moisLabel: string;
  risqueEleve: number;
  risqueMoyen: number;
}
