export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
  userRole: 'ADMIN' | 'RESPONSABLE_RH' | 'MANAGER';
  departement?: string;
}
