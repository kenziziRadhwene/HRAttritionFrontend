import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-format-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './format-dialog.component.html',
  styleUrl: './format-dialog.component.scss'
})
export class FormatDialogComponent {

  colonnesObligatoires = [
    'EmployeeNumber', 'Age', 'Gender', 'MaritalStatus', 'Department',
    'JobRole', 'JobLevel', 'BusinessTravel', 'MonthlyIncome', 'OverTime',
    'YearsAtCompany'
  ];

  colonnesOptionnelles = [
    'JobSatisfaction', 'WorkLifeBalance', 'PerformanceRating',
    'EnvironmentSatisfaction', 'RelationshipSatisfaction'
  ];

  constructor(private dialogRef: MatDialogRef<FormatDialogComponent>) {}

  fermer(): void {
    this.dialogRef.close();
  }
}
