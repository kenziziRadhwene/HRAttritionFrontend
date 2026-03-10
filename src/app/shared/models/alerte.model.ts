export interface Alerte {
  id: number;
  titre: string;
  message: string;
  probabilite: number;
  statut: 'NON_LUE' | 'LUE' | 'TRAITEE' | 'ARCHIVEE';
  emailDestinataire: string;
  emailEnvoye: boolean;
  dateEnvoi?: string;
  dateCreation: string;
  employeeId: number;
  employeeNom: string;
  employeeMatricule: string;
}
