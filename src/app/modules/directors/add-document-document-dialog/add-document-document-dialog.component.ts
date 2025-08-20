import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DialogContainerComponent } from 'app/layout/common/dialog-container/dialog-container.component';
import { DocumentationComponent } from 'app/shared/components/document/documentation.component';
import { UploadedDocumentsComponent } from 'app/shared/components/uploaded-documents/uploaded-documents.component';
import { DirectorsService } from '../directors.service';
import { mergeMap } from 'rxjs';

@Component({
  selector: 'app-docuement-document-add-dialog',
  templateUrl: './add-document-document-dialog.component.html',
  styleUrls: ['./add-document-document-dialog.component.scss'],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    DialogContainerComponent,
    UploadedDocumentsComponent, DocumentationComponent, MatExpansionModule,
  ],
  standalone: true
})
export class AddDirectorsDocumentDocumentDialogComponent implements AfterViewInit {

  selectedFiles: FileList;
  uploadedDocumentsPanelState: boolean = false
  uploadDocumentsPanelState: boolean = true;
  @ViewChild('uploadedDocumentsPanel') uploadedDocumentsPanel: MatExpansionPanel;
  @ViewChild('uploadDocumentsPanel') uploadDocumentsPanel: MatExpansionPanel; 

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddDirectorsDocumentDocumentDialogComponent>,
    private _directorsService: DirectorsService,
  ) {
  }

  ngAfterViewInit() {
    //this.uploadDocumentsPanel.open();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.dialogRef.close(this.selectedFiles);
  }

  uploadFile(event) {

    this.selectedFiles = event;
    this._directorsService.uploadDirectorIdCardDocuments(this.selectedFiles)
        .pipe(
            mergeMap(documentCode => this._directorsService
                .createDirectorIdCardDocument(this.data?.director?.code, this.data?.idCard?.code, {doc_code: documentCode, doc_name: this.selectedFiles[0]?.name, doc_type: this.selectedFiles[0]?.type})),
        ).subscribe((res) => {
            this.uploadedDocumentsPanel.open();
            this.uploadDocumentsPanel.close();
            this.data.documents = res?.ids?.find(c => c?.code === this.data?.idCard?.code)?.documents;
        });
  }
}
