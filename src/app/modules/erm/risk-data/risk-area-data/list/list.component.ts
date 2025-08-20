import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';

import { ErmService } from '../../../../../shared/services/erm.service';
import { RiskAreaData, RiskAreaDataPagination } from '../../../models/risk-area-data.model';
import { RiskAreaDataService } from '../risk-area-data.service';
import { RiskAreaDataAddDialogComponent } from '../../../../../shared/dialogs/risk-area-data-add/risk-area-data-add.dialog.component';
import { RiskArea } from '../../../master-data/kri/kri.types';
import { KriService } from '../../../master-data/kri/kri.service';

@Component({
    selector: 'app-risk-data-risk-area-data-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    providers: [ErmService]
})
export class RiskAreaDataListComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    alert: { type: FuseAlertType, message: string } = {
        type: 'success',
        message: ''
    };

    isPerforming = false;
    showAlert = false;
    flashMessage: 'success' | 'error' | null = null;

    columns: string[] = ['riskAreaName', 'period', 'weight', 'quantWeight', 'qualWeight', 'quantScore', 'qualScore', 'details'];
    selectedRiskAreaDataForm: FormGroup;
    pagination: RiskAreaDataPagination;
    riskAreaDatas$: Observable<RiskAreaData[]>;
    selectedRiskAreaData: RiskAreaData | null = null;
    isLoading = true;
    riskAreaDatasCount = 0;
    riskAreas: RiskArea[];
    filterEnabled = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _unsubscribeRiskAreaAll: Subject<any> = new Subject<any>();
    public filterButtonPress: Subject<any> = new Subject<any>();
    public resetButtonPress: Subject<any> = new Subject<any>();

    quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
            ['clean']
        ]
    };

    @ViewChild('input', { static: true }) input: ElementRef;

    query = {
        sort: 'created_at',
        order: 'asc',
        page: 0,
        year: '2021',
        size: 10,
        month: undefined as string | undefined,
        riskAreaId: undefined as string | undefined,
        id: ''
    };

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

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fb: FormBuilder,
        private dialog: MatDialog,
        private _riskAreaDataService: RiskAreaDataService,
        private _kriService: KriService,
        private _toartr: ToastrService
    ) {}

    ngOnInit(): void {
        this.selectedRiskAreaDataForm = this._fb.group({
            id: [''],
            riskAreaName: { disabled: true, value: '' },
            month: { disabled: true, value: '' },
            year: { disabled: true, value: '' },
            riskAreaId: ['', [Validators.required]],
            weight: ['', [Validators.required]],
            quantitativeWeight: ['', [Validators.required]],
            qualitativeWeight: ['', [Validators.required]],
            qualitativeScore: ['', [Validators.required]],
            quantitativeScore: { disabled: true, value: '' },
            description: ['']
        });

        this._kriService.getRiskArea()
            .pipe(takeUntil(this._unsubscribeRiskAreaAll))
            .subscribe((res: any) => {
                this.riskAreas = res.data;
                this._changeDetectorRef.markForCheck();
            });

        this.subscriberToButtonEvents();
        this.getData();
    }

    getData(): void {
        this._riskAreaDataService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: RiskAreaDataPagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.riskAreaDatas$ = this._riskAreaDataService.riskAreaDatas$;
        this._riskAreaDataService.riskAreaDatas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((riskAreaDatas: RiskAreaData[]) => {
                this.riskAreaDatasCount = riskAreaDatas.length;
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            });
    }

    toggleDetails(id: string): void {
        if (this.selectedRiskAreaData && this.selectedRiskAreaData.id === id) {
            this.closeDetails();
            return;
        }

        this._riskAreaDataService.getRiskAreaDataById(id)
            .subscribe((kriData) => {
                this.selectedRiskAreaData = kriData;
                this.selectedRiskAreaDataForm.patchValue(kriData);
                this._changeDetectorRef.markForCheck();
            });
    }

    getDate(month: string, year: string): Date {
        return new Date(`${month}/8/${year}`);
    }

    closeDetails(): void {
        this.selectedRiskAreaData = null;
    }

    ngAfterViewInit(): void {
        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
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
                    this.query.sort = this._sort.active;
                    this.query.order = this._sort.direction as 'asc' | 'desc' | '';
                    return this._riskAreaDataService.getRiskAreaDatas(this.query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(0);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    updateSelectedRiskAreaData(): void {
        this.isPerforming = true;
        const kriAreaData = this.selectedRiskAreaDataForm.getRawValue();

        this._riskAreaDataService.updateRiskAreaData(kriAreaData.id, kriAreaData)
            .subscribe(
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

    showFlashMessage(type: 'success' | 'error'): void {
        this.flashMessage = type;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
            this.flashMessage = null;
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    filter(): void {
        this.query.page = 0;
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
            id: ''
        };
    }

    createRiskAreaData(): void {
        const dialogRef = this.dialog.open(RiskAreaDataAddDialogComponent, {});
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._riskAreaDataService.createRiskAreaData(result)
                    .subscribe(
                        (kriData) => {
                            if (kriData instanceof HttpErrorResponse) {
                                this.alert.type = 'error';
                                this.alert.message = kriData.error.message;
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

    ngOnChanges(changes: SimpleChanges): void {
        console.log('changes', changes);
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
                    return this._riskAreaDataService.getRiskAreaDatas(this.query);
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
                    return this._riskAreaDataService.getRiskAreaDatas(this.query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }
}
