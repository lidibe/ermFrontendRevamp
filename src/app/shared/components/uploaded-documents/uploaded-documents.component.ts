import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    ViewEncapsulation,
    inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DialogConfigService } from 'app/shared/services/dialog-config.service';
import { DocumentDTO } from 'app/shared/types/file.types';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { DocumentPreviewDialogComponent } from '../document-preview-dialog/document-preview-dialog.component';
import { DocumentService } from 'app/shared/services/document.service';
import { DirectorsService } from 'app/modules/directors/directors.service';
import { MeetingsService } from 'app/modules/meetings/meetings.service';

@Component({
    selector: 'app-uploaded-documents',
    templateUrl: './uploaded-documents.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgIf,
        NgClass,
        NgFor,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        AsyncPipe,
        DocumentPreviewDialogComponent,
        MatTooltipModule,
    ],
    standalone: true,
})
export class UploadedDocumentsComponent implements OnDestroy {
    @Input() documents: DocumentDTO[] = [];
    @Input() parentElementCode: string;
    @Input() elementCode: string;
    @Input() target: string;
    private _destroyed$: Subject<void> = new Subject<void>();
    selectedFiles: DocumentDTO[] = [];

    private _documentService = inject(DocumentService);
    private _sanitizer = inject(DomSanitizer);
    private _dialog = inject(MatDialog);
    private _dialogConfigService = inject(DialogConfigService);
    private _directorsService = inject(DirectorsService);
    private _meetingsService = inject(MeetingsService);
    private _changeDetectorRef = inject(ChangeDetectorRef)
    @Output() messageEvent = new EventEmitter<DocumentDTO>();

    getSafeUrl(url: string): SafeUrl {
        return this._sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    async openPreview(document: DocumentDTO, status?: string): Promise<void> {
        if (!!!document.previewUrl) {
        document.url = (await firstValueFrom(this._documentService.get(document.code)))
        document.previewUrl = this.getSafeUrl(document.url);}

        this._dialog
            .open(DocumentPreviewDialogComponent, {
                data: { document: document, status: status },
            })
            .afterClosed()
            .pipe(takeUntil(this._destroyed$))
            .subscribe((res) => {
                if (res) {
                    console.log(document)
                }
            });
    }

    getIconForDocument(type: string): string {
        switch (type) {
            case 'image/png':
            case 'image/jpeg':
            case 'image/jpg':
            case 'image/gif':
                return 'mat_solid:image';
            case 'application/pdf':
                return 'mat_solid:picture_as_pdf';
            default:
                return 'mat_solid:insert_drive_file';
        }
    }

    deleteDocument(document: DocumentDTO){
        switch (this.target) {
            case 'id-card': {
              this.handleIdCardDocumentDeletion(document);
              break;
            }
            case 'meeting': {
              this.handleMeetingDocumentDeletion(document);
              break;
            }
            default: {
              console.warn(`Unhandled target: ${this.target}`);
            }
          }
    }

    handleIdCardDocumentDeletion(document: DocumentDTO) {
    this._directorsService.deleteIdCardDocument(this.parentElementCode, this.elementCode, document.code)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => {
        this.documents = res?.ids?.find(c => c?.code === this.elementCode)?.documents;
        this._changeDetectorRef.detectChanges();
      });
  }
  
    handleMeetingDocumentDeletion(document: DocumentDTO) {
    this._meetingsService.deleteMeetingDocument(this.elementCode, document.code)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((res) => {
        this.documents = res?.documents;
        this._changeDetectorRef.detectChanges();
      });
  }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }
}
