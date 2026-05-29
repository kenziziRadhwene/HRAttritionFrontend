// src/app/shared/models/admin-dashboard.model.ts

export interface AdminDashboardStats {
  // KPIs
  totalUtilisateurs: number;
  actionsAujourdhui: number;

  // Line Chart — activité 7 derniers jours { "2025-05-23": 12, ... }
  activiteHebdomadaire: { [date: string]: number };

  // Tableau — 5 dernières actions
  dernieresActions: DerniereAction[];

  // Doughnut — répartition par rôle { "ADMIN": 2, "RESPONSABLE_RH": 5, "MANAGER": 8 }
  repartitionParRole: { [role: string]: number };
}

export interface DerniereAction {
  id: number;
  utilisateur: string;
  email: string;
  role: string;
  action: string;
  actionLabel: string;
  targetTable: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}
