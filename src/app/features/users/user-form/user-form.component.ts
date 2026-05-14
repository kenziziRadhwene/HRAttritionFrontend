import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import {MatDivider} from '@angular/material/list';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDivider
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {

  editMode = false;
  userId: number | null = null;

  roles = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'RESPONSABLE_RH', label: 'Responsable RH' },
    { value: 'MANAGER', label: 'Manager' }
  ];

  departements = [
    'DIRECTION_GENERALE',
    'DIRECTION_RESSOURCES_HUMAINES',
    'DIRECTION_ADMINISTRATIVE_FINANCIERE',
    'DIRECTION_JURIDIQUE',
    'DIRECTION_TECHNOLOGIQUE',
    'DIRECTION_RELATIONS_OPERATEURS',
    'DIRECTION_SERVICE_CLIENT'
  ];

  form: any = {
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    userRole: 'MANAGER',
    departement: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Si un id est présent dans l'URL → mode édition
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.userId = +id;
      this.userService.getById(this.userId).subscribe({
        next: (user) => {
          this.form = { ...user, motDePasse: '', departement: user.departement || '' };
        },
        error: () => this.snackBar.open('Erreur chargement utilisateur', 'Fermer', { duration: 3000 })
      });
    }
  }

  saveUser(): void {
    if (!this.form.nom || !this.form.prenom || !this.form.email) {
      this.snackBar.open('Veuillez remplir tous les champs', 'Fermer', { duration: 3000 });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.form.email)) {
      this.snackBar.open('❌ Email invalide', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.form.userRole === 'MANAGER' && !this.form.departement) {
      this.snackBar.open('❌ Le département est obligatoire pour un Manager', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.editMode && this.userId) {
      this.userService.update(this.userId, this.form).subscribe({
        next: () => {
          this.snackBar.open('✅ Utilisateur modifié !', 'Fermer', { duration: 2000 });
          this.router.navigate(['/users']);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Erreur modification';
          this.snackBar.open(`❌ ${msg}`, 'Fermer', { duration: 3000 });
        }
      });
    } else {
      if (!this.form.motDePasse) {
        this.snackBar.open('❌ Le mot de passe est obligatoire', 'Fermer', { duration: 3000 });
        return;
      }
      this.userService.create(this.form).subscribe({
        next: () => {
          this.snackBar.open('✅ Utilisateur créé !', 'Fermer', { duration: 2000 });
          this.router.navigate(['/users']);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Erreur création';
          this.snackBar.open(`❌ ${msg}`, 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
