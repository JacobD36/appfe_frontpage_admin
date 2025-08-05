import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, shareReplay, switchMap, throwError } from 'rxjs';
import { LoginResponse } from './interfaces/login-response.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    constructor(
        @Inject('API_URL') private apiUrl: string
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('El usuario ya está autenticado.');
        }

        return this._httpClient.post(`${this.apiUrl}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
        }).pipe(
            switchMap((response: LoginResponse) => {
                // Store the access token in the local storage
                this.accessToken = response.token;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                response.data.connectionStatus = 'online';
                this._userService.user = response.data;

                // Return a new observable with the response
                return of(response.data);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post(`${this.apiUrl}/auth/sign-in-with-token`, {
                token: this.accessToken,
            })
            .pipe(
                shareReplay(1),
                catchError((error) => {
                    this._authenticated = false;
                    return of(false);
                }),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.

                    if (response && response.code === 200 && response.data) {
                        // Actualiza el token con el nuevo recibido
                        if (response.token) {
                            this.accessToken = response.token;
                        }

                        // Usuario autenticado exitosamente
                        this._authenticated = true;

                        // Almacena la información del usuario
                        response.data.connectionStatus = 'online';
                        this._userService.user = response.data;

                        return of(true);
                    } else {
                        // Maneja respuestas no exitosas desde el backend
                        this._authenticated = false;
                        return of(false);
                    }
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post(`${this.apiUrl}/users`, {
            name: user.name,
            email: user.email,
            password: user.password,
        });
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
