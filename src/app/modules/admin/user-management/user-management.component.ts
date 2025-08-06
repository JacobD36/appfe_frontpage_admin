import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { UserManagementService, UserData, CreateUserRequest, UpdateUserRequest } from './user-management.service';
import { UserDialogComponent, UserDialogData } from './user-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';
import { UserDetailsDialogComponent } from './user-details-dialog.component';

export interface User {
    id: number;
    nombre: string;
    email: string;
    rol: 'ADMIN_ROLE' | 'USER_ROLE';
}

@Component({
    selector     : 'user-management',
    standalone   : true,
    templateUrl  : './user-management.component.html',
    styleUrls    : ['./user-management.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatSnackBarModule
    ]
})
export class UserManagementComponent implements OnInit, OnDestroy
{
    displayedColumns: string[] = ['id', 'nombre', 'email', 'rol', 'status', 'opciones'];
    users: UserData[] = [];
    isLoading = false;
    searchTerm = '';

    // Configuración de paginación
    pageSize = 10;
    pageIndex = 0;
    totalUsers = 0;

    // Subject para destruir subscripciones
    private _unsubscribe$ = new Subject<void>();
    private _searchSubject = new Subject<string>();

    /**
     * Constructor
     */
    constructor(
        private _userManagementService: UserManagementService,
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar
    )
    {
        // Configurar búsqueda con debounce
        this._searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this._unsubscribe$)
        ).subscribe(searchTerm => {
            this.performSearch(searchTerm);
        });
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Suscribirse a los usuarios
        this._userManagementService.users$
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe(users => {
                this.users = users || [];
            });

        // Suscribirse al estado de carga
        this._userManagementService.loading$
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe(loading => {
                this.isLoading = loading;
            });

        // Suscribirse a la paginación
        this._userManagementService.pagination$
            .pipe(takeUntil(this._unsubscribe$))
            .subscribe(pagination => {
                console.log('Component received pagination:', pagination); // Debug log
                this.totalUsers = pagination.total;
                this.pageIndex = pagination.page - 1; // API usa 1-based, Material usa 0-based
                this.pageSize = pagination.limit;
                console.log('Component pageIndex:', this.pageIndex, 'totalUsers:', this.totalUsers, 'pageSize:', this.pageSize); // Debug log
            });

        // Cargar usuarios iniciales
        this.loadUsers();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }

    /**
     * Cargar usuarios
     */
    private loadUsers(): void
    {
        this._userManagementService.getUsers(
            this.pageIndex + 1, // API usa 1-based
            this.pageSize,
            this.searchTerm
        ).subscribe({
            error: (error) => {
                console.error('Error cargando usuarios:', error);
                const errorMessage = error.message || 'Error al cargar usuarios';
                this._snackBar.open(errorMessage, 'Cerrar', {
                    duration: 3000,
                    panelClass: ['error-snackbar']
                });
            }
        });
    }

    /**
     * Realizar búsqueda
     */
    private performSearch(searchTerm: string): void
    {
        this.searchTerm = searchTerm;
        this.pageIndex = 0; // Resetear a la primera página
        this.loadUsers();
    }

    /**
     * Manejar búsqueda
     */
    onSearch(event: Event): void
    {
        const searchTerm = (event.target as HTMLInputElement).value;
        this._searchSubject.next(searchTerm);
    }

    /**
     * Manejar cambio de página
     */
    onPageChange(event: PageEvent): void
    {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadUsers();
    }

    /**
     * Obtener clase CSS para el rol
     */
    getRoleClass(rol: string): string
    {
        return rol === 'ADMIN_ROLE' ? 'role-admin' : 'role-user';
    }

    /**
     * Obtener texto del rol
     */
    getRoleText(rol: string): string
    {
        return rol === 'ADMIN_ROLE' ? 'Administrador' : 'Usuario';
    }

    /**
     * Obtener iniciales del nombre
     */
    getInitials(name: string): string
    {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    /**
     * Obtener texto del estado
     */
    getStatusText(status: boolean): string
    {
        return status ? 'Activo' : 'Inactivo';
    }

    /**
     * Obtener clase CSS para el estado
     */
    getStatusClass(status: boolean): string
    {
        return status ? 'status-active' : 'status-inactive';
    }

    /**
     * Verificar si un usuario es el administrador principal que no se puede editar/eliminar
     */
    isProtectedAdminUser(user: UserData): boolean
    {
        // Verificar que sea el usuario "administrador" y tenga rol de administrador
        return user.name.toLowerCase() === 'administrador' && user.role === 'ADMIN_ROLE';
    }

    /**
     * Acciones de la tabla
     */
    viewUser(user: UserData): void
    {
        this._userManagementService.getUserById(user.id).subscribe({
            next: (response) => {
                const dialogRef = this._dialog.open(UserDetailsDialogComponent, {
                    width: '500px',
                    maxWidth: '90vw',
                    maxHeight: '80vh',
                    panelClass: 'user-details-container',
                    data: response.data
                });

                dialogRef.afterClosed().subscribe((result) => {
                    if (result && result.action === 'edit') {
                        this.editUser(result.user);
                    }
                });
            },
            error: (error) => {
                const errorMessage = error.message || 'Error al obtener detalles del usuario';
                this._snackBar.open(errorMessage, 'Cerrar', {
                    duration: 3000,
                    panelClass: ['error-snackbar']
                });
            }
        });
    }

    editUser(user: UserData): void
    {
        // Verificar si es un usuario protegido
        if (this.isProtectedAdminUser(user)) {
            this._snackBar.open('El usuario administrador no se puede editar', 'Cerrar', {
                duration: 3000,
                panelClass: ['warn-snackbar']
            });
            return;
        }

        const dialogRef = this._dialog.open(UserDialogComponent, {
            width: '450px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            panelClass: 'user-dialog-container',
            data: {
                user: user,
                isEdit: true
            } as UserDialogData
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.action === 'edit') {
                const updateData: UpdateUserRequest = result.user;
                this._userManagementService.updateUser(user.id, updateData).subscribe({
                    next: (response) => {
                        this._snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
                            duration: 3000,
                            panelClass: ['success-snackbar']
                        });
                        this.loadUsers(); // Recargar la lista
                    },
                    error: (error) => {
                        const errorMessage = error.message || 'Error al actualizar usuario';
                        this._snackBar.open(errorMessage, 'Cerrar', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
            }
        });
    }

    deleteUser(user: UserData): void
    {
        // Verificar si es un usuario protegido
        if (this.isProtectedAdminUser(user)) {
            this._snackBar.open('El usuario administrador no se puede eliminar', 'Cerrar', {
                duration: 3000,
                panelClass: ['warn-snackbar']
            });
            return;
        }

        const dialogRef = this._dialog.open(ConfirmDialogComponent, {
            width: '400px',
            maxWidth: '90vw',
            maxHeight: '60vh',
            panelClass: 'confirm-dialog-container',
            data: {
                title: 'Inactivar Usuario',
                message: `¿Estás seguro de que quieres inactivar al usuario "${user.name}"? El usuario ya no podrá autenticarse.`,
                confirmText: 'Inactivar',
                cancelText: 'Cancelar',
                color: 'warn'
            } as ConfirmDialogData
        });

        dialogRef.afterClosed().subscribe((confirmed) => {
            if (confirmed) {
                this._userManagementService.deleteUser(user.id).subscribe({
                    next: () => {
                        this._snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
                            duration: 3000,
                            panelClass: ['success-snackbar']
                        });
                        this.loadUsers(); // Recargar la lista
                    },
                    error: (error) => {
                        const errorMessage = error.message || 'Error al eliminar usuario';
                        this._snackBar.open(errorMessage, 'Cerrar', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
            }
        });
    }

    /**
     * Crear nuevo usuario
     */
    createUser(): void
    {
        const dialogRef = this._dialog.open(UserDialogComponent, {
            width: '450px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            panelClass: 'user-dialog-container',
            data: {
                isEdit: false
            } as UserDialogData
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.action === 'create') {
                const createData: CreateUserRequest = result.user;
                this._userManagementService.createUser(createData).subscribe({
                    next: (response) => {
                        this._snackBar.open('Usuario creado exitosamente', 'Cerrar', {
                            duration: 3000,
                            panelClass: ['success-snackbar']
                        });
                        this.loadUsers(); // Recargar la lista
                    },
                    error: (error) => {
                        const errorMessage = error.message || 'Error al crear usuario';
                        this._snackBar.open(errorMessage, 'Cerrar', {
                            duration: 3000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
            }
        });
    }
}
