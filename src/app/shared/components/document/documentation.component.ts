import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
    Component,
    EventEmitter,
    OnDestroy,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-documentation',
    templateUrl: './documentation.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgIf,
        NgClass,
        NgFor,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        AsyncPipe,
        MatTooltipModule,
    ],
    standalone: true,
})
export class DocumentationComponent implements OnDestroy {
    @Output() uploadFile = new EventEmitter();
    private _destroyed$: Subject<void> = new Subject<void>();
    isDragOver: boolean = false;

    onUploadFile(event): void {
        const files: File[] = Array.from(event.target.files);
        this.uploadFile.emit(files)
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
        if (event.dataTransfer?.files) {
            this.onUploadFile({ target: { files: event.dataTransfer.files } });
        }
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }
}
