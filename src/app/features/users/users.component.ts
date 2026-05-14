import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { User } from '../../shared/models/user.model';
import {UserService} from '../../core/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  loading = true;
  currentUserEmail: string | null = null;

  displayedColumns = ['nom', 'email', 'role', 'actions'];

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

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    public router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Récupère l'id de l'admin connecté depuis le token JWT
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserEmail = payload.sub ?? null;
      } catch (e) {
        console.error('Erreur décodage token', e);
      }
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur chargement utilisateurs', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteUser(user: User): void {
    Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous vraiment supprimer ${user.prenom} ${user.nom} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c62828',
      cancelButtonColor: '#888',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then(result => {
      if (result.isConfirmed) {
        this.userService.delete(user.id!).subscribe({
          next: () => {
            Swal.fire({
              title: 'Supprimé !',
              text: `${user.prenom} ${user.nom} a été supprimé.`,
              icon: 'success',
              confirmButtonColor: '#c62828',
              timer: 2000,
              timerProgressBar: true,
            });
            this.loadUsers();
          },
          error: () => {
            Swal.fire({
              title: 'Erreur',
              text: 'Une erreur est survenue lors de la suppression.',
              icon: 'error',
              confirmButtonColor: '#c62828',
            });
          }
        });
      }
    });
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':          return 'Administrateur';
      case 'ROLE_RESPONSABLE_RH': return 'Responsable RH';
      case 'ROLE_MANAGER':        return 'Manager';
      case 'ADMIN':               return 'Administrateur';
      case 'RESPONSABLE_RH':      return 'Responsable RH';
      case 'MANAGER':             return 'Manager';
      default:                    return role;
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':
      case 'ADMIN':               return 'warn';
      case 'ROLE_RESPONSABLE_RH':
      case 'RESPONSABLE_RH':      return 'accent';
      default:                    return 'primary';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
