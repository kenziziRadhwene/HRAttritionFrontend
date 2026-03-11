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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/user.model';

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
    MatToolbarModule,
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
  showForm = false;
  editMode = false;
  selectedUserId: number | null = null;

  displayedColumns = ['nom', 'email', 'role', 'actions'];

  roles = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'RESPONSABLE_RH', label: 'Responsable RH' },
    { value: 'MANAGER', label: 'Manager' }
  ];

  // Formulaire
  form: User = {
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    userRole: 'MANAGER'
  };

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
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

  openCreateForm(): void {
    this.editMode = false;
    this.selectedUserId = null;
    this.form = { nom: '', prenom: '', email: '', motDePasse: '', userRole: 'MANAGER' as any };
    this.showForm = true;
  }

  openEditForm(user: User): void {
    this.editMode = true;
    this.selectedUserId = user.id!;
    this.form = { ...user, motDePasse: '' };
    this.showForm = true;
  }

  saveUser(): void {
    if (!this.form.nom || !this.form.prenom || !this.form.email) {
      this.snackBar.open('Veuillez remplir tous les champs', 'Fermer', { duration: 3000 });
      return;
    }

    // Validation email côté Angular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.form.email)) {
      this.snackBar.open('❌ Email invalide', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.editMode && this.selectedUserId) {
      this.userService.update(this.selectedUserId, this.form).subscribe({
        next: () => {
          this.snackBar.open('✅ Utilisateur modifié !', 'Fermer', { duration: 2000 });
          this.showForm = false;
          this.loadUsers();
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
          this.showForm = false;
          this.loadUsers();
        },
        error: (err) => {
          const msg = err?.error?.message || 'Erreur création';
          this.snackBar.open(`❌ ${msg}`, 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (!confirm(`Supprimer ${user.prenom} ${user.nom} ?`)) return;

    this.userService.delete(user.id!).subscribe({
      next: () => {
        this.snackBar.open('✅ Utilisateur supprimé !', 'Fermer', { duration: 2000 });
        this.loadUsers();
      },
      error: () => this.snackBar.open('❌ Erreur suppression', 'Fermer', { duration: 3000 })
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
      case 'ADMIN':          return 'warn';
      case 'ROLE_RESPONSABLE_RH':
      case 'RESPONSABLE_RH': return 'accent';
      default:               return 'primary';
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
