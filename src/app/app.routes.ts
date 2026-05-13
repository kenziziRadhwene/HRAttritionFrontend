import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/auth/unauthorized/unauthorized.component')
        .then(m => m.UnauthorizedComponent)
  },

  // ⭐ TOUTES LES PAGES — utilisent le layout commun (sidebar + toolbar)
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [

      // ✅ DASHBOARD — maintenant dans le layout
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

      // ⚠️ ORDRE CRITIQUE : routes spécifiques AVANT /:id
      {
        path: 'employees/import',
        canActivate: [roleGuard(['ROLE_ADMIN', 'ROLE_RESPONSABLE_RH'])],
        loadComponent: () =>
          import('./features/employees/import/import.component')
            .then(m => m.ImportComponent)
      },

      {
        path: 'employees/:id/historique',
        canActivate: [roleGuard(['ROLE_ADMIN', 'ROLE_RESPONSABLE_RH', 'ROLE_MANAGER'])],
        loadComponent: () =>
          import('./features/employees/employee-historique/employee-historique.component')
            .then(m => m.EmployeeHistoriqueComponent)
      },

      {
        path: 'employees/:id',
        canActivate: [roleGuard(['ROLE_ADMIN', 'ROLE_RESPONSABLE_RH'])],
        loadComponent: () =>
          import('./features/employees/employee-detail/employee-detail.component')
            .then(m => m.EmployeeDetailComponent)
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
      }
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];
