import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService, DashboardStats, Task, ScheduleItem, IssuesData } from './dashboard.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
    selector: 'dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatMenuModule,
        MatTabsModule,
        MatTableModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        NgApexchartsModule
    ]
})
export class DashboardComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Component properties
    isLoading = false;
    currentUser: User;

    // Dashboard data
    stats: DashboardStats[] = [];
    recentTasks: Task[] = [];
    scheduleItems: ScheduleItem[] = [];

    // Issues data
    newIssues = 0;
    closedIssues = 0;
    issueMetrics = {
        fixed: 0,
        wontFix: 0,
        reopened: 0,
        needsTriage: 0
    };

    // Chart data for issues summary
    issuesChartOptions: any;
    taskDistributionChartOptions: any;

    constructor(
        private _dashboardService: DashboardService,
        private _userService: UserService
    ) {}

    ngOnInit(): void {
        // Get current user
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(user => {
                this.currentUser = user;
            });

        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private loadDashboardData(): void {
        this._dashboardService.getDashboardData()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => {
                this.stats = data.stats;
                this.recentTasks = data.recentTasks;
                this.scheduleItems = data.scheduleItems;

                // Issues data
                this.newIssues = data.issuesData.newIssues;
                this.closedIssues = data.issuesData.closedIssues;
                this.issueMetrics = data.issuesData.metrics;

                this.initializeCharts(data.issuesData);
                this.isLoading = false;
            });
    }

    private initializeCharts(issuesData: IssuesData): void {
        // Issues summary chart
        this.issuesChartOptions = {
            chart: {
                type: 'line',
                height: 300,
                toolbar: {
                    show: false
                },
                sparkline: {
                    enabled: false
                }
            },
            series: [{
                name: 'Nuevas Incidencias',
                data: issuesData.chartData.newIssues
            }, {
                name: 'Incidencias Cerradas',
                data: issuesData.chartData.closedIssues
            }],
            xaxis: {
                categories: issuesData.chartData.categories,
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                show: true,
                axisBorder: {
                    show: false
                }
            },
            colors: ['#3B82F6', '#10B981'],
            stroke: {
                curve: 'smooth',
                width: 2
            },
            grid: {
                show: true,
                borderColor: '#E5E7EB',
                strokeDashArray: 3
            },
            legend: {
                show: false
            }
        };

        // Task distribution chart
        this.taskDistributionChartOptions = {
            chart: {
                type: 'donut',
                height: 200,
                toolbar: {
                    show: false
                }
            },
            series: [40, 30, 20, 10],
            labels: ['En progreso', 'Completadas', 'Pendientes', 'Canceladas'],
            colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
            legend: {
                show: false
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '60%'
                    }
                }
            },
            dataLabels: {
                enabled: false
            }
        };
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Completado':
                return 'bg-green-100 text-green-800';
            case 'En progreso':
                return 'bg-blue-100 text-blue-800';
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'Cancelado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getPriorityClass(priority: string): string {
        switch (priority) {
            case 'Alta':
                return 'bg-red-100 text-red-800';
            case 'Media':
                return 'bg-orange-100 text-orange-800';
            case 'Baja':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    /**
     * Check if current user is admin
     */
    isAdmin(): boolean {
        return this.currentUser?.role === 'ADMIN_ROLE';
    }
}
