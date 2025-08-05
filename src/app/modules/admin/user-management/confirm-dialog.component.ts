import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    color?: 'primary' | 'accent' | 'warn';
}

@Component({
    selector: 'confirm-dialog',
    standalone: true,
    template: `
        <div class="flex flex-col w-full">
            <!-- Header -->
            <div class="flex flex-0 items-center justify-between h-16 pr-4 pl-6 bg-card">
                <div class="text-lg font-medium">{{ data.title }}</div>
                <button mat-icon-button (click)="close()" tabindex="-1">
                    <mat-icon [svgIcon]="'heroicons_outline:x-mark'"></mat-icon>
                </button>
            </div>

            <!-- Content -->
            <div class="flex flex-col flex-auto p-6">
                <div class="text-secondary mb-6">{{ data.message }}</div>

                <!-- Actions -->
                <div class="flex items-center justify-end space-x-3">
                    <button mat-button (click)="close()">
                        {{ data.cancelText || 'Cancelar' }}
                    </button>
                    <button
                        mat-flat-button
                        [color]="data.color || 'warn'"
                        (click)="confirm()">
                        {{ data.confirmText || 'Confirmar' }}
                    </button>
                </div>
            </div>
        </div>
    `,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ]
})
export class ConfirmDialogComponent {
    constructor(
        private _dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) {}

    close(): void {
        this._dialogRef.close(false);
    }

    confirm(): void {
        this._dialogRef.close(true);
    }
}
