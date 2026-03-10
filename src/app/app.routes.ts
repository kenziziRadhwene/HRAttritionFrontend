import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ─── Redirect par défaut ───
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // ─── Login ───
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  // ─── Routes protégées ───
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/employees/employee-list/employee-list.component')
        .then(m => m.EmployeeListComponent)
  },
  {
    path: 'alertes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/alertes/alerte-list/alerte-list.component')
        .then(m => m.AlerteListComponent)
  },
  {
    path: 'simulation',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/simulation/simulation-comparaison/simulation-comparaison.component')
        .then(m => m.SimulationComparaisonComponent)
  },
  {
    path: 'recommandations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/recommandations/recommandations.component')
        .then(m => m.RecommandationsComponent)
  },

  {
    path: 'team',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/employees/team-view/team-view.component')
        .then(m => m.TeamViewComponent)
  },

  // ─── Redirect inconnu ───
  {
    path: '**',
    redirectTo: 'dashboard'
  }




];
