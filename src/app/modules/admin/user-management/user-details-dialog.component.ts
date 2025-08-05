import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { UserData } from './user-management.service';

@Component({
    selector: 'user-details-dialog',
    standalone: true,
    template: `
        <div class="flex flex-col w-full">
            <!-- Header -->
            <div class="flex flex-0 items-center justify-between h-16 pr-4 pl-6 bg-primary text-on-primary">
                <div class="text-lg font-medium">Detalles del Usuario</div>
                <button mat-icon-button (click)="close()" tabindex="-1">
                    <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
                </button>
            </div>

            <!-- Content -->
            <div class="flex flex-col flex-auto p-6">
                <!-- User Avatar -->
                <div class="flex items-center mb-6">
                    <div class="flex-shrink-0">
                        <img *ngIf="user.img; else avatarTemplate"
                             [src]="user.img"
                             [alt]="user.name"
                             class="h-16 w-16 rounded-full object-cover">
                        <ng-template #avatarTemplate>
                            <div class="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                                <span class="text-lg font-medium text-primary dark:text-primary-400">
                                    {{ getInitials(user.name) }}
                                </span>
                            </div>
                        </ng-template>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ user.name }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                    </div>
                </div>

                <!-- User Details -->
                <div class="space-y-3 mb-6">
                    <!-- ID -->
                    <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">ID:</span>
                        <span class="text-sm text-gray-900 dark:text-gray-100 font-mono">{{ user.id }}</span>
                    </div>

                    <!-- Role -->
                    <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Rol:</span>
                        <mat-chip [ngClass]="getRoleClass(user.role)" class="text-xs">
                            {{ getRoleText(user.role) }}
                        </mat-chip>
                    </div>

                    <!-- Status -->
                    <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Estado:</span>
                        <mat-chip [ngClass]="getStatusClass(user.status)" class="text-xs">
                            {{ getStatusText(user.status) }}
                        </mat-chip>
                    </div>

                    <!-- Email Verified -->
                    <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Email verificado:</span>
                        <mat-chip [ngClass]="user.emailValidated ? 'status-active' : 'status-inactive'" class="text-xs">
                            {{ user.emailValidated ? 'Verificado' : 'No verificado' }}
                        </mat-chip>
                    </div>

                    <!-- Created Date -->
                    <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de creación:</span>
                        <span class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(user.created_at) }}</span>
                    </div>

                    <!-- Updated Date -->
                    <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700" *ngIf="user.updated_at">
                        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Última actualización:</span>
                        <span class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(user.updated_at) }}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end space-x-3">
                    <button mat-button (click)="close()">
                        Cerrar
                    </button>
                    <button mat-flat-button [color]="'primary'" (click)="edit()">
                        Editar Usuario
                    </button>
                </div>
            </div>
        </div>
    `,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule
    ]
})
export class UserDetailsDialogComponent {
    constructor(
        private _dialogRef: MatDialogRef<UserDetailsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public user: UserData
    ) {}

    close(): void {
        this._dialogRef.close();
    }

    edit(): void {
        this._dialogRef.close({ action: 'edit', user: this.user });
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    getRoleClass(role: string): string {
        return role === 'ADMIN_ROLE' ? 'role-admin' : 'role-user';
    }

    getRoleText(role: string): string {
        return role === 'ADMIN_ROLE' ? 'Administrador' : 'Usuario';
    }

    getStatusClass(status: boolean): string {
        return status ? 'status-active' : 'status-inactive';
    }

    getStatusText(status: boolean): string {
        return status ? 'Activo' : 'Inactivo';
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
