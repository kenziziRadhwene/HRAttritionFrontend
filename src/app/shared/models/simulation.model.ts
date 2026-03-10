export interface SimulationResponse {
  employeeId: number;
  employeeNom: string;
  employeeMatricule: string;
  typeSimulation: string;
  descriptionScenario: string;
  probabiliteActuelle: number;
  probabiliteSimulee: number;
  impactPourcentage: number;
  niveauRisqueActuel: string;
  niveauRisqueSimule: string;
  recommandation: string;
  actionRecommandee: boolean;
}

export interface ComparaisonSimulation {
  employeeId: number;
  employeeNom: string;
  employeeMatricule: string;
  probabiliteActuelle: number;
  niveauRisqueActuel: string;
  simulationSalaire: SimulationResponse;
  simulationPoste: SimulationResponse;
  simulationFormation: SimulationResponse;
  meilleureAction: string;
  typeSimulationRecommande: string;
  meilleurImpact: number;
}
