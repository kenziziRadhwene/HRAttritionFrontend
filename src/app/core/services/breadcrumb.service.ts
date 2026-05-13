// src/app/core/services/breadcrumb.service.ts

import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {

  private breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  breadcrumbs = this.breadcrumbs$.asObservable();

  // Mapping route → label + icône
  private routeLabels: { [key: string]: { label: string; icon: string } } = {
    'dashboard'      : { label: 'Dashboard',             icon: 'dashboard'       },
    'employees'      : { label: 'Employés',              icon: 'people'          },
    'import'         : { label: 'Import',                icon: 'upload_file'     },
    'historique'     : { label: 'Historique des scores', icon: 'history'         },
    'alertes'        : { label: 'Alertes',               icon: 'notifications'   },
    'simulation'     : { label: 'Simulation ML',         icon: 'science'         },
    'recommandations': { label: 'Recommandations',       icon: 'lightbulb'       },
    'team'           : { label: 'Vue Équipe',            icon: 'groups'          },
    'users'          : { label: 'Gestion Utilisateurs',  icon: 'manage_accounts' },
    'unauthorized'   : { label: 'Non autorisé',          icon: 'block'           },
  };

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const breadcrumbs = this.buildBreadcrumbs();
        this.breadcrumbs$.next(breadcrumbs);
      });
  }

  private buildBreadcrumbs(): Breadcrumb[] {
    const url = this.router.url;
    const segments = url.split('/').filter(s => s && s !== '');

    const breadcrumbs: Breadcrumb[] = [
      { label: 'Accueil', url: '/dashboard', icon: 'home' }
    ];

    let currentUrl = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentUrl += `/${segment}`;

      // Ignorer si c'est un ID numérique (ex: /employees/42)
      if (/^\d+$/.test(segment)) {
        // On enrichit le breadcrumb précédent avec "Détail"
        breadcrumbs.push({
          label: 'Détail',
          url: currentUrl,
          icon: 'person'
        });
        continue;
      }

      // Ignorer "dashboard" car c'est déjà "Accueil"
      if (segment === 'dashboard') continue;

      const config = this.routeLabels[segment];
      if (config) {
        breadcrumbs.push({
          label: config.label,
          url: currentUrl,
          icon: config.icon
        });
      }
    }

    return breadcrumbs;
  }
}
