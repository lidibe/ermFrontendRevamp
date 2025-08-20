import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SummaryDataListComponent } from '../list/list.component';
import { SummaryData, RiskArea } from '../summary-data.types';
import { FuseAlertType } from '@fuse/components/alert';
import { SummaryDataService } from '../summary-data.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'summary-data-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryDataDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    showAlert = false;
    flashMessage: 'success' | 'error' | null = null;

    years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
    months = [
        { id: '1', value: 'January' },
        { id: '2', value: 'February' },
        { id: '3', value: 'March' },
        { id: '4', value: 'April' },
        { id: '5', value: 'May' },
        { id: '6', value: 'June' },
        { id: '7', value: 'July' },
        { id: '8', value: 'August' },
        { id: '9', value: 'September' },
        { id: '10', value: 'October' },
        { id: '11', value: 'November' },
        { id: '12', value: 'December' }
    ];

    quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
            ['clean']
        ]
    };

    editMode = false;

    summaryData: SummaryData;
    form: FormGroup;
    summaryDatas: SummaryData[];
    riskAreas: RiskArea[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _summaryDataListComponent: SummaryDataListComponent,
        private _summaryDataService: SummaryDataService,
        private _formBuilder: FormBuilder,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this._summaryDataListComponent.matDrawer.open();

        this.form = this._formBuilder.group({
            id: ['', [Validators.required]],
            year: ['', [Validators.required]],
            month: ['', [Validators.required]],
            description: [''],
            comments: [''],
            createdAt: [''],
            updatedAt: [''],
            deletedAt: ['']
        });

        this._summaryDataService.summaryDatas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((summaryDatas: SummaryData[]) => {
                this.summaryDatas = summaryDatas;
                this._changeDetectorRef.markForCheck();
            });

        this._summaryDataService.summaryData$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((summaryData: SummaryData) => {
                this._summaryDataListComponent.matDrawer.open();
                this.summaryData = summaryData;
                this.form.patchValue(summaryData);
                this.toggleEditMode(false);
                this._changeDetectorRef.markForCheck();
            });

        this._summaryDataService.riskAreas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((riskAreas: RiskArea[]) => {
                this.riskAreas = riskAreas;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(0);
        this._unsubscribeAll.complete();

        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._summaryDataListComponent.matDrawer.close();
    }

    toggleEditMode(editMode: boolean | null = null): void {
        this.editMode = editMode === null ? !this.editMode : editMode;
        this._changeDetectorRef.markForCheck();
    }

    updateSummaryData(): void {
        const summaryData = this.form.getRawValue();

        this._summaryDataService.updateSummaryData(summaryData.id, summaryData).subscribe((response) => {
            this.toggleEditMode(false);

            if (response instanceof HttpErrorResponse) {
                this.alert.type = 'error';
                this.alert.message = response.error.message;
                this.showAlert = true;

                setTimeout(() => {
                    this.showAlert = false;
                }, 2000);
            }
        });
    }

    getMonth(month: string): string {
        let ret = '';
        switch (month) {
            case '1': ret = 'January'; break;
            case '2': ret = 'February'; break;
            case '3': ret = 'March'; break;
            case '4': ret = 'April'; break;
            case '5': ret = 'May'; break;
            case '6': ret = 'June'; break;
            case '7': ret = 'July'; break;
            case '8': ret = 'August'; break;
            case '9': ret = 'September'; break;
            case '10': ret = 'October'; break;
            case '11': ret = 'November'; break;
            case '12': ret = 'December'; break;
        }
        return ret;
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
