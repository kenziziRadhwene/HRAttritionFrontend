// src/app/shared/components/breadcrumb/breadcrumb.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';

import { BreadcrumbService, Breadcrumb } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {

  breadcrumbs$: Observable<Breadcrumb[]>;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router
  ) {
    this.breadcrumbs$ = this.breadcrumbService.breadcrumbs;
  }

  navigate(url: string): void {
    this.router.navigateByUrl(url);
  }
}
