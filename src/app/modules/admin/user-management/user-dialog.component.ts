import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UserData } from './user-management.service';

export interface UserDialogData {
    user?: UserData;
    isEdit: boolean;
}

@Component({
    selector: 'user-dialog',
    standalone: true,
    template: `
        <div class="flex flex-col w-full">
            <!-- Header -->
            <div class="flex flex-0 items-center justify-between h-16 pr-4 pl-6 bg-primary text-on-primary">
                <div class="text-lg font-medium">{{ data.isEdit ? 'Editar Usuario' : 'Crear Usuario' }}</div>
                <button mat-icon-button (click)="close()" tabindex="-1">
                    <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
                </button>
            </div>

            <!-- Form -->
            <form class="flex flex-col flex-auto p-6 overflow-y-auto" [formGroup]="userForm">
                <!-- Name -->
                <mat-form-field class="w-full mb-4">
                    <mat-label>Nombre completo</mat-label>
                    <input matInput formControlName="name" required>
                    <mat-error *ngIf="userForm.get('name')?.hasError('required')">
                        El nombre es requerido
                    </mat-error>
                </mat-form-field>

                <!-- Email -->
                <mat-form-field class="w-full mb-4">
                    <mat-label>Correo electrónico</mat-label>
                    <input matInput type="email" formControlName="email" [readonly]="data.isEdit" required>
                    <mat-hint *ngIf="data.isEdit">El correo electrónico no se puede modificar</mat-hint>
                    <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                        El correo es requerido
                    </mat-error>
                    <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                        Ingrese un correo válido
                    </mat-error>
                </mat-form-field>

                <!-- Password (only for create) -->
                <mat-form-field class="w-full mb-6" *ngIf="!data.isEdit">
                    <mat-label>Contraseña</mat-label>
                    <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
                    <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                        <mat-icon [svgIcon]="hidePassword ? 'heroicons_outline:eye' : 'heroicons_outline:eye-slash'"></mat-icon>
                    </button>
                    <mat-hint>Contraseña generada automáticamente. Puedes modificarla si lo deseas.</mat-hint>
                    <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                        La contraseña es requerida
                    </mat-error>
                    <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                        La contraseña debe tener al menos 8 caracteres
                    </mat-error>
                    <mat-error *ngIf="userForm.get('password')?.hasError('passwordComplexity')">
                        La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial
                    </mat-error>
                </mat-form-field>

                <!-- Role -->
                <mat-form-field class="w-full mb-4">
                    <mat-label>Rol</mat-label>
                    <mat-select formControlName="role">
                        <mat-option value="USER_ROLE">Usuario</mat-option>
                        <mat-option value="ADMIN_ROLE">Administrador</mat-option>
                    </mat-select>
                </mat-form-field>

                <!-- Status (only for edit) -->
                <div class="flex items-center mb-6" *ngIf="data.isEdit">
                    <mat-slide-toggle formControlName="status" color="primary">
                        Usuario activo
                    </mat-slide-toggle>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end mt-4 space-x-3">
                    <button mat-button (click)="close()" type="button">
                        Cancelar
                    </button>
                    <button
                        mat-flat-button
                        [color]="'primary'"
                        [disabled]="userForm.invalid || loading"
                        (click)="save()"
                        type="button">
                        <span *ngIf="loading" class="inline-flex items-center">
                            <mat-icon class="icon-size-4 animate-spin mr-2" [svgIcon]="'heroicons_outline:arrow-path'"></mat-icon>
                            Guardando...
                        </span>
                        <span *ngIf="!loading">
                            {{ data.isEdit ? 'Actualizar' : 'Crear' }}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    `,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatIconModule
    ]
})
export class UserDialogComponent implements OnInit {
    userForm: FormGroup;
    loading = false;
    hidePassword = true;

    constructor(
        private _formBuilder: FormBuilder,
        private _dialogRef: MatDialogRef<UserDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UserDialogData
    ) {
        // Create the form
        this.userForm = this._formBuilder.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: [''],
            role: ['USER_ROLE', [Validators.required]],
            status: [true]
        });

        // Add password validation for create mode
        if (!this.data.isEdit) {
            this.userForm.get('password')?.setValidators([
                Validators.required,
                Validators.minLength(8),
                this.passwordComplexityValidator
            ]);
        }
    }

    ngOnInit(): void {
        // If editing, populate the form
        if (this.data.isEdit && this.data.user) {
            this.userForm.patchValue({
                name: this.data.user.name,
                email: this.data.user.email,
                role: this.data.user.role,
                status: this.data.user.status
            });
        } else {
            // Generate automatic password for new users
            const generatedPassword = this.generateSecurePassword();
            console.log('Generated password:', generatedPassword); // Debug log
            this.userForm.patchValue({
                password: generatedPassword
            });
            // Update validators after setting the value
            this.userForm.get('password')?.updateValueAndValidity();
        }
    }

    close(): void {
        this._dialogRef.close();
    }

    /**
     * Custom validator for password complexity
     */
    private passwordComplexityValidator(control: any): { [key: string]: boolean } | null {
        const password = control.value;
        if (!password) {
            return null;
        }

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

        const valid = hasLowercase && hasUppercase && hasNumber && hasSpecialChar;

        return valid ? null : { passwordComplexity: true };
    }

    /**
     * Generate a secure password that meets API requirements:
     * - Minimum 8 characters
     * - At least one lowercase letter
     * - At least one uppercase letter
     * - At least one number
     * - At least one special character
     */
    private generateSecurePassword(): string {
        const minLength = 8;
        const maxLength = 12;

        // Define character sets
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        // Ensure at least one character from each required set
        let password = '';
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

        // Fill the rest randomly from all character sets
        const allChars = lowercase + uppercase + numbers + specialChars;
        const finalLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

        for (let i = password.length; i < finalLength; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        // Shuffle the password to randomize the position of required characters
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    save(): void {
        if (this.userForm.invalid) {
            return;
        }

        this.loading = true;
        const formValue = { ...this.userForm.value };

        // Remove password if editing and it's empty
        if (this.data.isEdit && !formValue.password) {
            delete formValue.password;
        }

        // Remove email if editing (email cannot be changed)
        if (this.data.isEdit) {
            delete formValue.email;
        }

        this._dialogRef.close({
            action: this.data.isEdit ? 'edit' : 'create',
            user: formValue
        });
    }
}
