import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, Observable, Subject} from 'rxjs';
import {ErmService} from '../../../../../shared/services/erm.service';
import {debounceTime, map, switchMap, takeUntil} from 'rxjs/operators';
import {ThresholdService} from '../threshold.service';
import {Threshold, ThresholdPagination} from '../../../models/threshold.model';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {KriThresholdDialogComponent} from '../../../../../shared/dialogs/kri-threshold/kri-threshold.dialog.component';
import {KriService} from '../../kri/kri.service';
import {Kri} from '../../kri/kri.types';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';

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
    showAlert: boolean = false;
    flashMessage: 'success' | 'error' | null = null;
    columns: string[] = ['key', 'name', 'period', 'bau', 'target', 'limit', 'details'];
    selectedThresholdForm: FormGroup;
    pagination: ThresholdPagination;
    thresholds$: Observable<Threshold[]>;
    selectedThreshold: Threshold | null = null;
    isLoading = true;
    thresholdsCount: number = 0;
    kris: Kri[] = [];
    filterEnabled: boolean;
    private _unsubscribeKriAll: Subject<any> = new Subject<any>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    filterButtonPress: Subject<any> = new Subject<any>();
    resetButtonPress: Subject<any> = new Subject<any>();
    years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
    months = [
        {id: '1', value: 'January'},
        {id: '2', value: 'February'},
        {id: '3', value: 'March'},
        {id: '4', value: 'April'},
        {id: '5', value: 'May'},
        {id: '6', value: 'June'},
        {id: '7', value: 'July'},
        {id: '8', value: 'August'},
        {id: '9', value: 'September'},
        {id: '10', value: 'October'},
        {id: '11', value: 'November'},
        {id: '12', value: 'December'},
    ];

    query = {
        sort: 'created_at',
        order: 'asc',
        page: 0,
        year: undefined,
        size: 10,
        month: undefined,
        riskAreaId: undefined,
        kriId: undefined,
        id: '',
    };

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fb: FormBuilder,
        private dialog: MatDialog,
        private _kriService: KriService,
        private _thresholdService: ThresholdService,
    ) {
    }

    ngOnInit(): void {

        this.selectedThresholdForm = this._fb.group({
            id: ['', [Validators.required]],
            kri_id: ['', [Validators.required]],
            name: {disabled: true, value: ''},
            month: {disabled: true, value: ''},
            year: {disabled: true, value: ''},
            bau: ['', [Validators.required]],
            trigger: ['', [Validators.required]],
            rlimit: ['', [Validators.required]],
            trigger_max: ['', []],
            trigger_min: ['', []],
            // trigger_min_dir: ['', []],
            // trigger_max_dir: ['', []],
        });

        this.subscriberToButtonEvents();

        // Get the pagination
        this._thresholdService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ThresholdPagination) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._kriService.getKris()
            .pipe(takeUntil(this._unsubscribeKriAll))
            .subscribe((res: any) => {
                this.kris = res.data;
                this._changeDetectorRef.markForCheck();
            });

        // Get the risk areas
        this.thresholds$ = this._thresholdService.thresholds$;
        this._thresholdService.thresholds$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((riskAreas: Threshold[]) => {

                // Update the counts
                this.thresholdsCount = riskAreas.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
                this.isLoading = false;
            });
    }

    createThreshold(): void {
        const dialogRef = this.dialog.open(KriThresholdDialogComponent, {});

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._thresholdService.createThreshold(result)
                    .subscribe(
                        (threshold) => {
                            if (threshold instanceof HttpErrorResponse) {
                                this.alert.type = 'error';
                                this.alert.message = threshold.error.message;
                                this.showAlert = true;

                                setTimeout(() => {
                                    // this.alert = null;
                                    this.showAlert = false;
                                }, 2000);
                            }

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        },
                        (error) => {
                            // console.log(error);
                        }
                    );
            }
        });
    }

    toggleDetails(id: string): void {
        if (this.selectedThreshold && this.selectedThreshold.id === id) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by id
        this._thresholdService.getThresholdById(id)
            .subscribe((threshold) => {
                // Set the selected product
                console.log(threshold);
                this.selectedThreshold = threshold;
                // Fill the form
                this.selectedThresholdForm.patchValue(threshold);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedThreshold = null;
    }


    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // If the user changes the sort order...
        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                // Reset back to the first page
                this._paginator.pageIndex = 0;

                // Close the details
                this.closeDetails();
            });

        // Get products if sort or page changes
        merge(this._sort.sortChange, this._paginator.page).pipe(
            switchMap(() => {
                this.closeDetails();
                this.isLoading = true;
                this.query.size = this._paginator.pageSize;
                this.query.page = this._paginator.pageIndex;
                this.query.sort = this._sort.active;
                this.query.order = this._sort.direction;
                return this._thresholdService.getThresholds(this.query);
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(0);
        this._unsubscribeAll.complete();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    getDate(month: string, year: string): Date {
        const date = new Date(`${month}/4/${year}`);
        return date;
    }

    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {

            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    /**
     * Update the selected product using the form mock-api
     */
    updateSelectedThreshold(): void {
        this.isPerforming = true;
        // Get the product object
        const threshold = this.selectedThresholdForm.getRawValue();

        // Update the product on the server
        this._thresholdService.updateThreshold(threshold.id, threshold)
            .subscribe(() => {
                    this.isPerforming = false;
                    // Show a success message
                    this.showFlashMessage('success');
                },
                ((error: HttpErrorResponse) => {
                    this.isPerforming = false;
                    this.showFlashMessage('error');
                    console.log(error.error);
                })
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
            id: '',
        };
    }

    subscriberToButtonEvents(): void {
        this.filterButtonPress
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
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
                switchMap((query) => {
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
