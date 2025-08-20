import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';

@Component({
    selector: 'app-confirm-delete-dialog',
    templateUrl: './confirm-delete-dialog.component.html',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        DialogContainerComponent,
        MatDividerModule,
    ],
    standalone: true,
})
export class ConfirmDeleteDialogComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public origin: string,
        public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    ) {}

    ngOnInit(): void {}

    closeDialog() {
        this.dialogRef.close();
    }

    onSubmit() {
        this.dialogRef.close({});
    }
}
