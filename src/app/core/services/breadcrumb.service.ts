import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
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

  private overrides: { [segment: string]: Breadcrumb } = {};

  private routeLabels: { [key: string]: { label: string; icon: string } } = {
    'dashboard'      : { label: 'Dashboard',                    icon: 'dashboard'       },
    'employees'      : { label: 'Employés',                     icon: 'people'          },
    'import'         : { label: 'Import',                       icon: 'upload_file'     },
    'historique'     : { label: 'Historique des scores',        icon: 'history'         },
    'alertes'        : { label: 'Alertes',                      icon: 'notifications'   },
    'simulation'     : { label: 'Simulation des décisions RH',  icon: 'science'         }, // ← FIX
    'recommandations': { label: 'Recommandations',              icon: 'lightbulb'       },
    'team'           : { label: 'Vue Équipe',                   icon: 'groups'          },
    'users'          : { label: 'Gestion Utilisateurs',         icon: 'manage_accounts' },
    'unauthorized'   : { label: 'Non autorisé',                 icon: 'block'           },
    'new'            : { label: 'Ajouter un utilisateur',       icon: 'person_add'      },
    'edit'           : { label: 'Modifier un utilisateur',      icon: 'edit'            },
  };

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.overrides = {};
        this.breadcrumbs$.next(this.buildBreadcrumbs());
      });
  }

  setSegmentOverride(segment: string, breadcrumb: Breadcrumb): void {
    this.overrides[segment] = breadcrumb;
    this.breadcrumbs$.next(this.buildBreadcrumbs());
  }

  private buildBreadcrumbs(): Breadcrumb[] {
    const url = this.router.url.split('?')[0]; // ← ignorer les query params
    const segments = url.split('/').filter(s => s && s !== '');

    const breadcrumbs: Breadcrumb[] = [
      { label: 'Accueil', url: '/dashboard', icon: 'home' }
    ];

    // ── Cas spécial : /simulation?employeeId=X ──────────────────────
    // La route n'a pas d'ID dans le path, on insère manuellement
    // Employés + nom (via override sur 'simulation')
    if (segments.length === 1 && segments[0] === 'simulation') {
      breadcrumbs.push({ label: 'Employés', url: '/employees', icon: 'people' });

      if (this.overrides['simulation']) {
        // override 'simulation' contient le nom de l'employé (posé par le composant)
        breadcrumbs.push(this.overrides['simulation']);
      }

      breadcrumbs.push({
        label: this.routeLabels['simulation'].label,
        url: '/simulation',
        icon: this.routeLabels['simulation'].icon
      });

      return breadcrumbs;
    }
    // ───────────────────────────────────────────────────────────────

    let currentUrl = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentUrl += `/${segment}`;

      if (segment === 'dashboard') continue;

      if (/^\d+$/.test(segment)) {
        const prevSegment = segments[i - 1];
        if (prevSegment === 'edit') continue;

        if (this.overrides[segment]) {
          breadcrumbs.push(this.overrides[segment]);
        } else {
          breadcrumbs.push({ label: 'Détail', url: currentUrl, icon: 'person' });
        }
        continue;
      }

      const config = this.routeLabels[segment];
      if (config) {
        breadcrumbs.push({ label: config.label, url: currentUrl, icon: config.icon });
      }
    }

    return breadcrumbs;
  }
}
