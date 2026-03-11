import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  // ─── Admin + RH ───
  {
    path: 'dashboard',
    canActivate: [roleGuard(['ROLE_ADMIN', 'ROLE_RESPONSABLE_RH'])],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'employees',
    canActivate: [roleGuard(['ROLE_ADMIN', 'ROLE_RESPONSABLE_RH', 'ROLE_MANAGER'])],
    loadComponent: () =>
      import('./features/employees/employee-list/employee-list.component')
        .then(m => m.EmployeeListComponent)
  },
  {
    path: 'alertes',
    canActivate: [roleGuard(['ROLE_ADMIN', 'ROLE_RESPONSABLE_RH'])],
    loadComponent: () =>
      import('./features/alertes/alerte-list/alerte-list.component')
        .then(m => m.AlerteListComponent)
  },
  {
    path: 'simulation',
    canActivate: [roleGuard(['ROLE_ADMIN', 'ROLE_RESPONSABLE_RH'])],
    loadComponent: () =>
      import('./features/simulation/simulation-comparaison/simulation-comparaison.component')
        .then(m => m.SimulationComparaisonComponent)
  },
  {
    path: 'recommandations',
    canActivate: [roleGuard(['ROLE_ADMIN', 'ROLE_RESPONSABLE_RH', 'ROLE_MANAGER'])],
    loadComponent: () =>
      import('./features/recommandations/recommandations.component')
        .then(m => m.RecommandationsComponent)
  },

  // ─── Manager uniquement ───
  {
    path: 'team',
    canActivate: [roleGuard(['ROLE_ADMIN', 'ROLE_MANAGER'])],
    loadComponent: () =>
      import('./features/employees/team-view/team-view.component')
        .then(m => m.TeamViewComponent)
  },


  {
    path: 'users',
    canActivate: [roleGuard(['ROLE_ADMIN'])],
    loadComponent: () =>
      import('./features/users/users.component')
        .then(m => m.UsersComponent)
  },

  // ─── Unauthorized ───
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/auth/unauthorized/unauthorized.component')
        .then(m => m.UnauthorizedComponent)
  },

  { path: '**', redirectTo: 'dashboard' }
];
