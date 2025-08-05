import { Injectable, inject, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface UserData {
    id: string;
    name: string;
    email: string;
    password?: string;
    img?: string;
    role: 'USER_ROLE' | 'ADMIN_ROLE';
    status: boolean;
    emailValidated: boolean;
    created_at: string;
    updated_at?: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role?: 'USER_ROLE' | 'ADMIN_ROLE';
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    password?: string;
    img?: string;
    role?: 'USER_ROLE' | 'ADMIN_ROLE';
    status?: boolean;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
    search?: string;
}

export interface UsersResponse {
    code: number;
    message: string;
    status: string;
    data: {
        data: UserData[];
        pagination: PaginationInfo;
    };
}

export interface UserResponse {
    code: number;
    message: string;
    status: string;
    data: UserData;
}

export interface CreateUserResponse {
    code: number;
    message: string;
    status: string;
    data: {
        user_id: string;
        user_email: string;
    };
}

export interface UpdateUserResponse {
    code: number;
    message: string;
    status: string;
    data: {
        user_id: string;
    };
}

export interface DeleteUserResponse {
    code: number;
    message: string;
    status: string;
    data: {
        user_id: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private _httpClient = inject(HttpClient);
    private _users: BehaviorSubject<UserData[]> = new BehaviorSubject<UserData[]>([]);
    private _pagination: BehaviorSubject<PaginationInfo> = new BehaviorSubject<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
        has_previous: false,
        has_next: false,
        search: ''
    });
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _currentSearch: string = '';

    constructor(
        @Inject('API_URL') private apiUrl: string
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for users
     */
    get users$(): Observable<UserData[]> {
        return this._users.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<PaginationInfo> {
        return this._pagination.asObservable();
    }

    /**
     * Getter for loading state
     */
    get loading$(): Observable<boolean> {
        return this._loading.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get users with pagination and search
     */
    getUsers(page: number = 1, limit: number = 10, search: string = ''): Observable<UsersResponse> {
        this._loading.next(true);
        this._currentSearch = search;

        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (search) {
            params = params.set('search', search);
        }

        return this._httpClient.get<UsersResponse>(`${this.apiUrl}/users`, { params })
            .pipe(
                tap((response) => {
                    console.log('API Response:', response); // Debug log
                    console.log('Response data items:', response.data?.data); // Debug log
                    console.log('Response data pagination:', response.data?.pagination); // Debug log

                    this._users.next(response.data?.data || []);
                    // Conservar el término de búsqueda en la paginación
                    const paginationData = response.data?.pagination || {
                        page: 1,
                        limit: 10,
                        total: 0,
                        total_pages: 0,
                        has_previous: false,
                        has_next: false
                    };
                    this._pagination.next({
                        ...paginationData,
                        search: search
                    });
                    this._loading.next(false);
                }),
                catchError((error) => {
                    console.error('Error loading users:', error);
                    console.error('Error status:', error.status);
                    console.error('Error message:', error.message);
                    console.error('Full error:', error);

                    let errorMessage = 'Error al cargar usuarios';

                    if (error.status === 401) {
                        errorMessage = 'Token de autorización faltante o inválido';
                    } else if (error.status === 403) {
                        errorMessage = 'Permisos insuficientes para acceder a este recurso';
                    } else if (error.status === 400) {
                        errorMessage = 'Parámetros de consulta inválidos';
                    }

                    this._users.next([]);
                    this._pagination.next({
                        page: 1,
                        limit: 10,
                        total: 0,
                        total_pages: 0,
                        has_previous: false,
                        has_next: false,
                        search: search
                    });
                    this._loading.next(false);

                    return throwError(() => ({ ...error, message: errorMessage }));
                })
            );
    }

    /**
     * Get user by ID
     */
    getUserById(id: string): Observable<UserResponse> {
        return this._httpClient.get<UserResponse>(`${this.apiUrl}/users/${id}`)
            .pipe(
                catchError((error) => {
                    console.error('Error getting user by ID:', error);
                    let errorMessage = 'Error al obtener usuario';

                    if (error.status === 400) {
                        errorMessage = 'ID de usuario inválido';
                    } else if (error.status === 404) {
                        errorMessage = 'Usuario no encontrado';
                    } else if (error.status === 401) {
                        errorMessage = 'Token faltante o inválido';
                    } else if (error.status === 403) {
                        errorMessage = 'Permisos insuficientes';
                    }

                    return throwError(() => ({ ...error, message: errorMessage }));
                })
            );
    }

    /**
     * Create user
     */
    createUser(userData: CreateUserRequest): Observable<CreateUserResponse> {
        return this._httpClient.post<CreateUserResponse>(`${this.apiUrl}/users`, userData)
            .pipe(
                catchError((error) => {
                    console.error('Error creating user:', error);
                    let errorMessage = 'Error al crear usuario';

                    if (error.status === 400) {
                        errorMessage = error.error?.message || 'Datos de entrada inválidos';
                    } else if (error.status === 409) {
                        errorMessage = 'El usuario ya existe con este email';
                    } else if (error.status === 401) {
                        errorMessage = 'Token faltante o inválido';
                    } else if (error.status === 403) {
                        errorMessage = 'Permisos insuficientes';
                    }

                    return throwError(() => ({ ...error, message: errorMessage }));
                })
            );
    }

    /**
     * Update user
     */
    updateUser(id: string, userData: UpdateUserRequest): Observable<UpdateUserResponse> {
        return this._httpClient.put<UpdateUserResponse>(`${this.apiUrl}/users/${id}`, userData)
            .pipe(
                catchError((error) => {
                    console.error('Error updating user:', error);
                    let errorMessage = 'Error al actualizar usuario';

                    if (error.status === 400) {
                        errorMessage = error.error?.message || 'ID inválido o datos de entrada incorrectos';
                    } else if (error.status === 404) {
                        errorMessage = 'Usuario no encontrado';
                    } else if (error.status === 409) {
                        errorMessage = 'Email ya existe en el sistema';
                    } else if (error.status === 401) {
                        errorMessage = 'Token faltante o inválido';
                    } else if (error.status === 403) {
                        errorMessage = 'Permisos insuficientes';
                    }

                    return throwError(() => ({ ...error, message: errorMessage }));
                })
            );
    }

    /**
     * Delete user
     */
    deleteUser(id: string): Observable<DeleteUserResponse> {
        return this._httpClient.delete<DeleteUserResponse>(`${this.apiUrl}/users/${id}`)
            .pipe(
                catchError((error) => {
                    console.error('Error deleting user:', error);
                    let errorMessage = 'Error al eliminar usuario';

                    if (error.status === 400) {
                        errorMessage = 'ID de usuario inválido';
                    } else if (error.status === 404) {
                        errorMessage = 'Usuario no encontrado';
                    } else if (error.status === 401) {
                        errorMessage = 'Token faltante o inválido';
                    } else if (error.status === 403) {
                        errorMessage = 'Permisos insuficientes';
                    }

                    return throwError(() => ({ ...error, message: errorMessage }));
                })
            );
    }

    /**
     * Refresh users list
     */
    refreshUsers(): void {
        const currentPagination = this._pagination.value;
        this.getUsers(currentPagination.page, currentPagination.limit, currentPagination.search || '')
            .subscribe();
    }
}
