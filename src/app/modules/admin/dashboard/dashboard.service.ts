import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DashboardData {
    stats: DashboardStats[];
    recentTasks: Task[];
    issuesData: IssuesData;
    scheduleItems: ScheduleItem[];
}

export interface DashboardStats {
    title: string;
    value: number;
    subtitle: string;
    color: string;
    icon: string;
    completed?: number;
    fromYesterday?: number;
    closedToday?: number;
    implemented?: number;
    trend?: {
        value: number;
        isUp: boolean;
    };
}

export interface Task {
    id: string;
    title: string;
    status: 'Completado' | 'En progreso' | 'Pendiente' | 'Cancelado';
    priority: 'Alta' | 'Media' | 'Baja';
    dueDate: string;
    assignee?: string;
    progress?: number;
}

export interface IssuesData {
    newIssues: number;
    closedIssues: number;
    metrics: {
        fixed: number;
        wontFix: number;
        reopened: number;
        needsTriage: number;
    };
    chartData: {
        newIssues: number[];
        closedIssues: number[];
        categories: string[];
    };
}

export interface ScheduleItem {
    id: string;
    title: string;
    time: string;
    location?: string;
    type: 'meeting' | 'break' | 'task' | 'event';
    attendees?: number;
    isOnline?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor() { }

    /**
     * Get dashboard data
     */
    getDashboardData(): Observable<DashboardData> {
        const dashboardData: DashboardData = {
            stats: [
                {
                    title: 'Tareas Pendientes',
                    value: 21,
                    subtitle: 'Due Tasks',
                    color: 'text-blue-500',
                    icon: 'heroicons_outline:clock',
                    completed: 13,
                    trend: { value: 5, isUp: false }
                },
                {
                    title: 'Tareas Atrasadas',
                    value: 17,
                    subtitle: 'Tasks',
                    color: 'text-red-500',
                    icon: 'heroicons_outline:exclamation-triangle',
                    fromYesterday: 9,
                    trend: { value: 12, isUp: true }
                },
                {
                    title: 'Incidencias Abiertas',
                    value: 24,
                    subtitle: 'Open',
                    color: 'text-orange-500',
                    icon: 'heroicons_outline:bug-ant',
                    closedToday: 19,
                    trend: { value: 8, isUp: false }
                },
                {
                    title: 'Funcionalidades',
                    value: 38,
                    subtitle: 'Proposals',
                    color: 'text-green-500',
                    icon: 'heroicons_outline:light-bulb',
                    implemented: 16,
                    trend: { value: 22, isUp: true }
                }
            ],
            recentTasks: [
                {
                    id: '1',
                    title: 'Implementar autenticación JWT',
                    status: 'En progreso',
                    priority: 'Alta',
                    dueDate: '2025-08-07',
                    assignee: 'Juan Pérez',
                    progress: 75
                },
                {
                    id: '2',
                    title: 'Optimizar consultas de base de datos',
                    status: 'Pendiente',
                    priority: 'Media',
                    dueDate: '2025-08-10',
                    assignee: 'María García',
                    progress: 0
                },
                {
                    id: '3',
                    title: 'Actualizar documentación API',
                    status: 'Completado',
                    priority: 'Baja',
                    dueDate: '2025-08-05',
                    assignee: 'Carlos Ruiz',
                    progress: 100
                },
                {
                    id: '4',
                    title: 'Configurar pipeline CI/CD',
                    status: 'En progreso',
                    priority: 'Alta',
                    dueDate: '2025-08-08',
                    assignee: 'Ana López',
                    progress: 45
                },
                {
                    id: '5',
                    title: 'Refactorizar componente de dashboard',
                    status: 'Pendiente',
                    priority: 'Media',
                    dueDate: '2025-08-12',
                    assignee: 'Luis Martín',
                    progress: 0
                }
            ],
            issuesData: {
                newIssues: 214,
                closedIssues: 75,
                metrics: {
                    fixed: 3,
                    wontFix: 4,
                    reopened: 8,
                    needsTriage: 6
                },
                chartData: {
                    newIssues: [50, 55, 65, 52, 60, 55, 50],
                    closedIssues: [30, 25, 35, 40, 38, 42, 35],
                    categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
                }
            },
            scheduleItems: [
                {
                    id: '1',
                    title: 'Reunión de equipo',
                    time: '9:12 minutos',
                    location: 'Sala de conferencias 18',
                    type: 'meeting',
                    attendees: 8,
                    isOnline: false
                },
                {
                    id: '2',
                    title: 'Descanso para café',
                    time: '10:10 AM',
                    type: 'break'
                },
                {
                    id: '3',
                    title: 'Revisión de pull requests',
                    time: '11:30 AM',
                    type: 'task'
                },
                {
                    id: '4',
                    title: 'Demo del producto',
                    time: '14:00 PM',
                    location: 'Auditorium principal',
                    type: 'event',
                    attendees: 25,
                    isOnline: true
                },
                {
                    id: '5',
                    title: 'Retrospectiva del sprint',
                    time: '16:30 PM',
                    type: 'meeting',
                    attendees: 6,
                    isOnline: false
                }
            ]
        };

        // Simulate API delay
        return of(dashboardData).pipe(delay(500));
    }

    /**
     * Get tasks statistics
     */
    getTasksStatistics(): Observable<any> {
        return of({
            total: 156,
            completed: 89,
            inProgress: 32,
            pending: 28,
            cancelled: 7,
            distribution: [
                { status: 'Completadas', count: 89, percentage: 57 },
                { status: 'En progreso', count: 32, percentage: 21 },
                { status: 'Pendientes', count: 28, percentage: 18 },
                { status: 'Canceladas', count: 7, percentage: 4 }
            ]
        }).pipe(delay(300));
    }

    /**
     * Get user activity metrics
     */
    getUserMetrics(): Observable<any> {
        return of({
            totalUsers: 1247,
            activeUsers: 892,
            newUsersThisWeek: 23,
            userGrowth: 8.5,
            topUserActivities: [
                { activity: 'Login', count: 4521 },
                { activity: 'Task Creation', count: 1893 },
                { activity: 'File Upload', count: 892 },
                { activity: 'Comment', count: 567 },
                { activity: 'Profile Update', count: 234 }
            ]
        }).pipe(delay(400));
    }

    /**
     * Get system performance metrics
     */
    getSystemMetrics(): Observable<any> {
        return of({
            uptime: '99.9%',
            responseTime: '120ms',
            errorRate: '0.1%',
            throughput: '1.2k req/min',
            serverHealth: [
                { server: 'Web Server 1', status: 'healthy', cpu: 45, memory: 62 },
                { server: 'Web Server 2', status: 'healthy', cpu: 38, memory: 55 },
                { server: 'Database', status: 'healthy', cpu: 72, memory: 68 },
                { server: 'Cache', status: 'warning', cpu: 85, memory: 78 }
            ]
        }).pipe(delay(600));
    }
}
