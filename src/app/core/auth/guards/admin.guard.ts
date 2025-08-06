import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { UserService } from 'app/core/user/user.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {

    constructor(
        private _userService: UserService,
        private _router: Router
    ) {}

    canActivate(): Observable<boolean> {
        return this._userService.user$.pipe(
            map(user => {
                if (user.role === 'ADMIN_ROLE') {
                    return true;
                }

                // Redirect to dashboard if not admin
                this._router.navigate(['/dashboard']);
                return false;
            })
        );
    }
}
