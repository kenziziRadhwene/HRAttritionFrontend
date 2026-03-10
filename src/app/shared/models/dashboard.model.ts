export interface DashboardStats {
  totalEmployes: number;
  totalActifs: number;
  totalAlertes: number;
  alertesNonLues: number;
  totalPredictions: number;
  risqueEleve: number;
  risqueMoyen: number;
  risqueFaible: number;
  tauxRisqueEleve: number;
  repartitionDepartement: { [key: string]: number };
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
