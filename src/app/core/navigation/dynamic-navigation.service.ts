import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { UserService } from 'app/core/user/user.service';
import {
    defaultNavigation,
    compactNavigation,
    futuristicNavigation,
    horizontalNavigation
} from 'app/mock-api/common/navigation/data';

@Injectable({ providedIn: 'root' })
export class DynamicNavigationService {

    constructor(private _userService: UserService) {}

    /**
     * Get filtered navigation based on user role
     */
    getNavigation(): Observable<any> {
        return this._userService.user$.pipe(
            map(user => {
                const filteredDefaultNavigation = this.filterNavigationByRole(defaultNavigation, user.role);
                const filteredCompactNavigation = this.filterNavigationByRole(compactNavigation, user.role);
                const filteredFuturisticNavigation = this.filterNavigationByRole(futuristicNavigation, user.role);
                const filteredHorizontalNavigation = this.filterNavigationByRole(horizontalNavigation, user.role);

                return {
                    default: filteredDefaultNavigation,
                    compact: filteredCompactNavigation,
                    futuristic: filteredFuturisticNavigation,
                    horizontal: filteredHorizontalNavigation
                };
            })
        );
    }

    /**
     * Filter navigation items based on user role
     */
    private filterNavigationByRole(navigation: FuseNavigationItem[], userRole: string): FuseNavigationItem[] {
        return navigation.filter(item => {
            // Dashboard is always visible
            if (item.id === 'dashboard') {
                return true;
            }

            // User management only for ADMIN_ROLE
            if (item.id === 'user-management') {
                return userRole === 'ADMIN_ROLE';
            }

            // Add more role-based filters here as needed
            // For now, other items are visible to all authenticated users
            return true;
        });
    }

    /**
     * Check if user has admin role
     */
    isAdmin(): Observable<boolean> {
        return this._userService.user$.pipe(
            map(user => user.role === 'ADMIN_ROLE')
        );
    }

    /**
     * Check if user has specific role
     */
    hasRole(role: string): Observable<boolean> {
        return this._userService.user$.pipe(
            map(user => user.role === role)
        );
    }
}
