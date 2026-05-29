// src/app/shared/models/audit-log.model.ts

export interface AuditLog {
  id: number;
  utilisateur: string;
  email: string;
  role: string;
  action: string;
  actionLabel: string;
  targetTable: string;
  targetId: number;
  details: string;
  ipAddress: string;
  createdAt: string;
}

// Structure Page<> retournée par Spring
export interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;    // page courante
  size: number;
}
