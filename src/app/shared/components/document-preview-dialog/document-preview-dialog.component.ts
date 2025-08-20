import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';
import { DocumentDTO } from 'app/shared/types/file.types';

@Component({
    selector: 'app-document-preview-dialog',
    templateUrl: './document-preview-dialog.component.html',
    imports: [CommonModule, MatButtonModule, MatDividerModule, TitleCasePipe, MatIconModule, DialogContainerComponent],
    standalone: true,
})
export class DocumentPreviewDialogComponent {
    document: DocumentDTO;
    isSelected: boolean;

    constructor(
        public dialogRef: MatDialogRef<DocumentPreviewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { document: DocumentDTO, status: string }
    ) {
        console.log(data)
        this.document = data?.document;
        this.isSelected = data?.status === 'selected';
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }

}
