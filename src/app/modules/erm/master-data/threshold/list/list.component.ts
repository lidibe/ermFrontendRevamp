import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';

import { ErmService } from '../../../../../shared/services/erm.service';
import { ThresholdService } from '../threshold.service';
import { Threshold, ThresholdPagination } from '../../../models/threshold.model';
import { KriThresholdDialogComponent } from '../../../../../shared/dialogs/kri-threshold/kri-threshold.dialog.component';
import { KriService } from '../../kri/kri.service';
import { Kri } from '../../kri/kri.types';

@Component({
    selector: 'app-master-data-threshold-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    providers: [ErmService]
})
export class ThresholdListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };

    isPerforming = false;
    showAlert = false;
    flashMessage: 'success' | 'error' | null = null;

    columns: string[] = ['key', 'name', 'period', 'bau', 'target', 'limit', 'details'];

    selectedThresholdForm: FormGroup;
    pagination: ThresholdPagination;
    thresholds$: Observable<Threshold[]>;
    selectedThreshold: Threshold | null = null;

    isLoading = true;
    thresholdsCount = 0;
    kris: Kri[] = [];
    filterEnabled = false;

    private _unsubscribeKriAll: Subject<any> = new Subject<any>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    filterButtonPress: Subject<any> = new Subject<any>();
    resetButtonPress: Subject<any> = new Subject<any>();

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

    query = {
        sort: 'created_at',
        order: 'asc' as 'asc' | 'desc' | '',
        page: 0,
        year: undefined as string | undefined,
        size: 10,
        month: undefined as string | undefined,
        riskAreaId: undefined as string | undefined,
        kriId: undefined as string | undefined,
        id: ''
    };

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fb: FormBuilder,
        private dialog: MatDialog,
        private _kriService: KriService,
        private _thresholdService: ThresholdService
    ) {}

    ngOnInit(): void {
        this.selectedThresholdForm = this._fb.group({
            id: ['', [Validators.required]],
            kri_id: ['', [Validators.required]],
            name: { disabled: true, value: '' },
            month: { disabled: true, value: '' },
            year: { disabled: true, value: '' },
            bau: ['', [Validators.required]],
            trigger: ['', [Validators.required]],
            rlimit: ['', [Validators.required]],
            trigger_max: [''],
            trigger_min: ['']
        });

        this.subscriberToButtonEvents();

        this._thresholdService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ThresholdPagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this._kriService
            .getKris()
            .pipe(takeUntil(this._unsubscribeKriAll))
            .subscribe((res: any) => {
                this.kris = res.data;
                this._changeDetectorRef.markForCheck();
            });

        this.thresholds$ = this._thresholdService.thresholds$;

        this._thresholdService.thresholds$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: Threshold[]) => {
                this.thresholdsCount = items.length;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            });
    }

    createThreshold(): void {
        const dialogRef = this.dialog.open(KriThresholdDialogComponent, {});
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._thresholdService.createThreshold(result).subscribe(
                    (threshold) => {
                        if (threshold instanceof HttpErrorResponse) {
                            this.alert.type = 'error';
                            this.alert.message = threshold.error.message;
                            this.showAlert = true;
                            setTimeout(() => {
                                this.showAlert = false;
                            }, 2000);
                        }
                        this._changeDetectorRef.markForCheck();
                    },
                    () => {}
                );
            }
        });
    }

    toggleDetails(id: string): void {
        if (this.selectedThreshold && this.selectedThreshold.id === id) {
            this.closeDetails();
            return;
        }

        this._thresholdService.getThresholdById(id).subscribe((threshold) => {
            this.selectedThreshold = threshold;
            this.selectedThresholdForm.patchValue(threshold);
            this._changeDetectorRef.markForCheck();
        });
    }

    closeDetails(): void {
        this.selectedThreshold = null;
    }

    ngAfterViewInit(): void {
        this._sort.sortChange.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this._paginator.pageIndex = 0;
            this.closeDetails();
        });

        merge(this._sort.sortChange, this._paginator.page)
            .pipe(
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    this.query.size = this._paginator.pageSize;
                    this.query.page = this._paginator.pageIndex;
                    this.query.sort = this._sort.active as any;
                    this.query.order = this._sort.direction;
                    return this._thresholdService.getThresholds(this.query);
                }),
                map(() => {
                    this.isLoading = false;
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(0);
        this._unsubscribeAll.complete();
        this._unsubscribeKriAll.next(0);
        this._unsubscribeKriAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    getDate(month: string, year: string): Date {
        return new Date(`${month}/4/${year}`);
    }

    showFlashMessage(type: 'success' | 'error'): void {
        this.flashMessage = type;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
            this.flashMessage = null;
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    updateSelectedThreshold(): void {
        this.isPerforming = true;
        const threshold = this.selectedThresholdForm.getRawValue();
        this._thresholdService.updateThreshold(threshold.id, threshold).subscribe(
            () => {
                this.isPerforming = false;
                this.showFlashMessage('success');
            },
            (error: HttpErrorResponse) => {
                this.isPerforming = false;
                this.showFlashMessage('error');
                console.log(error.error);
            }
        );
    }

    reset(): void {
        this.filterEnabled = false;
        this.query = {
            sort: 'created_at',
            order: 'asc',
            page: 0,
            year: '2021',
            size: 10,
            month: undefined,
            riskAreaId: undefined,
            kriId: undefined,
            id: ''
        };
    }

    subscriberToButtonEvents(): void {
        this.filterButtonPress
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    this.filterEnabled = true;
                    return this._thresholdService.getThresholds(this.query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

        this.resetButtonPress
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    this.reset();
                    return this._thresholdService.getThresholds(this.query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }
}
