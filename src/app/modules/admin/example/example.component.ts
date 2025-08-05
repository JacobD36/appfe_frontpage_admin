import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';

export interface User {
    id: number;
    nombre: string;
    email: string;
    rol: 'ADMIN_ROLE' | 'USER_ROLE';
}

@Component({
    selector     : 'example',
    standalone   : true,
    templateUrl  : './example.component.html',
    styleUrls    : ['./example.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatChipsModule
    ]
})
export class ExampleComponent implements OnInit
{
    displayedColumns: string[] = ['id', 'nombre', 'email', 'rol', 'opciones'];
    users: User[] = [];
    paginatedUsers: User[] = [];

    // Configuración de paginación
    pageSize = 5;
    pageIndex = 0;
    totalUsers = 0;

    /**
     * Constructor
     */
    constructor()
    {
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.generateMockUsers();
        this.updatePaginatedUsers();
    }

    /**
     * Generar usuarios de prueba
     */
    private generateMockUsers(): void
    {
        const nombres = [
            'Ana García', 'Carlos Rodríguez', 'María López', 'Juan Martínez',
            'Laura Fernández', 'Diego Sánchez', 'Carmen Ruiz', 'Pedro Jiménez',
            'Isabel Torres', 'Roberto Morales'
        ];

        const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

        this.users = nombres.map((nombre, index) => {
            const email = nombre.toLowerCase()
                .replace(/\s+/g, '.')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') + '@' + domains[index % domains.length];

            return {
                id: index + 1,
                nombre: nombre,
                email: email,
                rol: index % 3 === 0 ? 'ADMIN_ROLE' : 'USER_ROLE'
            };
        });

        this.totalUsers = this.users.length;
    }

    /**
     * Actualizar usuarios paginados
     */
    private updatePaginatedUsers(): void
    {
        const startIndex = this.pageIndex * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedUsers = this.users.slice(startIndex, endIndex);
    }

    /**
     * Manejar cambio de página
     */
    onPageChange(event: PageEvent): void
    {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.updatePaginatedUsers();
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
     * Acciones de la tabla
     */
    viewUser(user: User): void
    {
        console.log('Ver usuario:', user);
    }

    editUser(user: User): void
    {
        console.log('Editar usuario:', user);
    }

    deleteUser(user: User): void
    {
        console.log('Eliminar usuario:', user);
    }
}
