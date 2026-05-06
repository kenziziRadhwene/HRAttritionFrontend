import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatDividerModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit {

  currentPageTitle = 'Tableau de Bord';
  currentIcon = 'dashboard';
  currentUser = '';
  currentRoute = '';

  isAdmin = false;
  isRH = false;
  isManager = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.isRH = this.authService.isRH();
    this.isManager = this.authService.isManager();
    this.currentUser = this.authService.getCurrentUser()?.email || '';
  }

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        this.updatePageTitle(event.url);
      }
    });
  }

  updatePageTitle(url: string): void {
    if (url.includes('/dashboard')) {
      this.currentPageTitle = 'Tableau de Bord';
      this.currentIcon = 'dashboard';
    } else if (url.includes('/employees')) {
      this.currentPageTitle = 'Gestion des Employés';
      this.currentIcon = 'people';
    } else if (url.includes('/alertes')) {
      this.currentPageTitle = 'Alertes';
      this.currentIcon = 'notifications';
    } else if (url.includes('/simulation')) {
      this.currentPageTitle = 'Simulation ML';
      this.currentIcon = 'science';
    } else if (url.includes('/recommandations')) {
      this.currentPageTitle = 'Recommandations';
      this.currentIcon = 'lightbulb';
    } else if (url.includes('/team')) {
      this.currentPageTitle = 'Vue Équipe';
      this.currentIcon = 'groups';
    } else if (url.includes('/users')) {
      this.currentPageTitle = 'Gestion Utilisateurs';
      this.currentIcon = 'manage_accounts';
    }
  }

  isActive(route: string): boolean {
    return this.currentRoute.includes(route);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
