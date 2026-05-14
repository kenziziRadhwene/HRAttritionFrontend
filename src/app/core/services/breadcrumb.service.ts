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

  // ── Overrides manuels : permettent à un composant de personnaliser
  //    un segment (ex: remplacer "Détail" par le vrai nom de l'employé)
  private overrides: { [segment: string]: Breadcrumb } = {};

  private routeLabels: { [key: string]: { label: string; icon: string } } = {
    'dashboard'      : { label: 'Dashboard',               icon: 'dashboard'       },
    'employees'      : { label: 'Employés',                icon: 'people'          },
    'import'         : { label: 'Import',                  icon: 'upload_file'     },
    'historique'     : { label: 'Historique des scores',   icon: 'history'         },
    'alertes'        : { label: 'Alertes',                 icon: 'notifications'   },
    'simulation'     : { label: 'Simulation ML',           icon: 'science'         },
    'recommandations': { label: 'Recommandations',         icon: 'lightbulb'       },
    'team'           : { label: 'Vue Équipe',              icon: 'groups'          },
    'users'          : { label: 'Gestion Utilisateurs',    icon: 'manage_accounts' },
    'unauthorized'   : { label: 'Non autorisé',            icon: 'block'           },
    'new'            : { label: 'Ajouter un utilisateur',  icon: 'person_add'      },
    'edit'           : { label: 'Modifier un utilisateur', icon: 'edit'            },
  };

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Réinitialiser les overrides à chaque navigation
        this.overrides = {};
        this.breadcrumbs$.next(this.buildBreadcrumbs());
      });
  }

  // ── Méthode publique : permet à un composant de remplacer
  //    le label d'un segment dynamique (ex: un ID numérique)
  //    Appeler après que les données sont chargées.
  //
  //    Exemple depuis employee-detail.component.ts :
  //    this.breadcrumbService.setSegmentOverride('42', {
  //      label: 'Jean Dupont', url: '/employees/42', icon: 'person'
  //    });
  setSegmentOverride(segment: string, breadcrumb: Breadcrumb): void {
    this.overrides[segment] = breadcrumb;
    this.breadcrumbs$.next(this.buildBreadcrumbs());
  }

  private buildBreadcrumbs(): Breadcrumb[] {
    const segments = this.router.url
      .split('?')[0]          // ignorer les query params
      .split('/')
      .filter(s => s && s !== '');

    const breadcrumbs: Breadcrumb[] = [
      { label: 'Accueil', url: '/dashboard', icon: 'home' }
    ];

    let currentUrl = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentUrl += `/${segment}`;

      // Ignorer "dashboard" car déjà présent comme "Accueil"
      if (segment === 'dashboard') continue;

      // Segment numérique (ID)
      if (/^\d+$/.test(segment)) {
        const prevSegment = segments[i - 1];

        // Ignorer les IDs qui suivent "edit" (ex: /users/edit/42)
        if (prevSegment === 'edit') continue;

        // Utiliser l'override si disponible (ex: nom de l'employé)
        if (this.overrides[segment]) {
          breadcrumbs.push(this.overrides[segment]);
        } else {
          // Fallback générique selon le contexte
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
