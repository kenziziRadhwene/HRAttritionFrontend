import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, NavigationStart } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { NotificationPanneauComponent } from '../../shared/components/notification-panneau/notification-panneau.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    NotificationPanneauComponent,
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    BreadcrumbComponent,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent implements OnInit {

  sidebarCollapsed = true;
  currentUser      = '';
  userInitials     = '';
  avatarColor      = '#AA0000';
  isAdmin          = false;
  isRH             = false;
  isManager        = false;
  hasScrolled      = false;
  isImporting      = false;
  currentRoute     = '';

  private avatarPalette = [
    '#b71c1c', '#880e4f', '#4a148c', '#1a237e',
    '#0d47a1', '#006064', '#1b5e20', '#e65100',
    '#bf360c', '#4e342e', '#37474f', '#AD1457',
  ];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {
    this.isAdmin   = this.authService.isAdmin();
    this.isRH      = this.authService.isRH();
    this.isManager = this.authService.isManager();

    const email = this.authService.getCurrentUser()?.email || '';
    this.currentUser  = email;
    this.userInitials = this.buildInitials(email);
    this.avatarColor  = this.buildAvatarColor(email);
  }

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isImporting = true;
      }
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        this.hasScrolled  = false;
        this.isImporting  = false;
      }
    });
  }

  // ─── AVATAR ─────────────────────────────
  private buildInitials(email: string): string {
    if (!email) return 'U';
    const name  = email.split('@')[0];
    const parts = name.split(/[._\-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  private buildAvatarColor(email: string): string {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarPalette[Math.abs(hash) % this.avatarPalette.length];
  }

  // ─── SCROLL SHADOW ──────────────────────
  onContentScroll(event: Event): void {
    this.hasScrolled = (event.target as HTMLElement).scrollTop > 10;
  }

  // ─── NAVIGATION ─────────────────────────
  isActiveRoute(path: string): boolean {
    return this.currentRoute.startsWith(path);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Nettoyage de la condition obsolète du rôle manager /team
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // ─── IMPORT CSV ─────────────────────────
  importerEmployes(): void {
    this.router.navigate(['/employees/import']);
  }

  // ─── LOGOUT ─────────────────────────────
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
