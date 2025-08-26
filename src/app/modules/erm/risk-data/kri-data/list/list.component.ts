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
import { ErmService } from '../../../../../shared/services/erm.service';
import { KriData, KriDataPagination } from '../../../models/kri-data.model';
import { KriDataService } from '../kri-data.service';
import { MatDialog } from '@angular/material/dialog';
import { KriDataAddDialogComponent } from '../../../../../shared/dialogs/kri-data-add/kri-data-add.dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { KriService } from '../../../master-data/kri/kri.service';
import { Kri } from '../../../master-data/kri/kri.types';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'app-risk-data-kri-data-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    providers: [ErmService]
})
export class KriDataListComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    showAlert = false;
    flashMessage: 'success' | 'error' | null = null;

    columns: string[] = ['kriName', 'period', 'value', 'status', 'details'];
    selectedKriDataForm: FormGroup;
    pagination: KriDataPagination;
    kriDatas$: Observable<KriData[]>;
    selectedKriData: KriData | null = null;
    isLoading = true;
    kriDatasCount = 0;
    kris: Kri[] = [];
    filterEnabled = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _unsubscribeKriAll: Subject<any> = new Subject<any>();
    filterButtonPress: Subject<any> = new Subject<any>();
    resetButtonPress: Subject<any> = new Subject<any>();

    query = {
        sort: 'created_at',
        order: 'asc',
        page: 0,
        year: '2021',
        size: 10,
        month: undefined as string | undefined,
        riskAreaId: undefined as string | undefined,
        kriId: undefined as string | undefined,
        id: '',
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
        { id: '12', value: 'December' },
    ];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fb: FormBuilder,
        private dialog: MatDialog,
        private _kriDataService: KriDataService,
        private _kriService: KriService,
        private _toartr: ToastrService,
    ) {}

    ngOnInit(): void {
        this.selectedKriDataForm = this._fb.group({
            id: [''],
            kriName: { disabled: true, value: '' },
            month: { disabled: true, value: '' },
            year: { disabled: true, value: '' },
            bau: { disabled: true, value: '' },
            trigger: { disabled: true, value: '' },
            rLimit: { disabled: true, value: '' },
            triggerMax: { disabled: true, value: '' },
            triggerMin: { disabled: true, value: '' },
            value: ['', [Validators.required]],
        });

        this._kriService.getKris()
            .pipe(takeUntil(this._unsubscribeKriAll))
            .subscribe((res: any) => {
                this.kris = res.data;
                this._changeDetectorRef.markForCheck();
            });

        this.subscriberToButtonEvents();

        this._kriDataService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: KriDataPagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.kriDatas$ = this._kriDataService.kriDatas$;
        this._kriDataService.kriDatas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((kriDatas: KriData[]) => {
                this.kriDatasCount = kriDatas.length;
                this._changeDetectorRef.markForCheck();
                this.isLoading = false;
            });
    }

    toggleDetails(id: string): void {
        if (this.selectedKriData && this.selectedKriData.id === id) {
            this.closeDetails();
            return;
        }
        this._kriDataService.getKriDataById(id)
            .subscribe((kriData) => {
                this.selectedKriData = kriData;
                this.selectedKriDataForm.patchValue(kriData);
                this._changeDetectorRef.markForCheck();
            });
    }

    getDate(month: string, year: string): Date {
        const date = parseInt(month, 10) < 10 ? `0${month}-15-${year}` : `${month}-15-${year}`;
        return new Date(date);
    }

    closeDetails(): void {
        this.selectedKriData = null;
        this._changeDetectorRef.markForCheck();
    }

    ngAfterViewInit(): void {
        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._paginator.pageIndex = 0;
                this.closeDetails();
            });

        merge(this._sort.sortChange, this._paginator.page).pipe(
            switchMap(() => {
                this.closeDetails();
                this.isLoading = true;
                this.query.size = this._paginator.pageSize;
                this.query.page = this._paginator.pageIndex;
                this.query.sort = this._sort.active;
                this.query.order = this._sort.direction;
                return this._kriDataService.getKriDatas(this.query);
            }),
            map(() => {
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(0);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    updateSelectedKriData(): void {
        const kriData = this.selectedKriDataForm.getRawValue();
        this._kriDataService.updateKriData(kriData.id, kriData).subscribe(() => {
            this.showFlashMessage('success');
        });
    }

    showFlashMessage(type: 'success' | 'error'): void {
        this.flashMessage = type;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
            this.flashMessage = null;
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    isTriggered(item: KriData): boolean {
        if (item.rLimit <= item.bau) {
            return item.value >= item.bau;
        } else {
            return item.value <= item.bau;
        }
    }

    createKriData(): void {
        const dialogRef = this.dialog.open(KriDataAddDialogComponent, {});
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._kriDataService.createKriData(result)
                    .subscribe(
                        (kriData) => {
                            if (kriData instanceof HttpErrorResponse) {
                                this.showAlert = true;
                                setTimeout(() => { this.showAlert = false; }, 2000);
                            }
                            this._changeDetectorRef.markForCheck();
                        },
                        () => {}
                    );
            }
        });
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
        this._changeDetectorRef.markForCheck();
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
                    return this._kriDataService.getKriDatas(this.query);
                }),
                map(() => {
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
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
                    return this._kriDataService.getKriDatas(this.query);
                }),
                map(() => {
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }
}
