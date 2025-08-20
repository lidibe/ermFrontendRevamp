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
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, Observable, Subject} from 'rxjs';
import {debounceTime, map, switchMap, takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastrService} from 'ngx-toastr';
import {ErmService} from '../../../shared/services/erm.service';
import {KriData, KriDataPagination} from '../models/kri-data.model';
import {Kri} from '../master-data/kri/kri.types';
import {KriDataService} from '../risk-data/kri-data/kri-data.service';
import {KriService} from '../master-data/kri/kri.service';
import {KriDataAddDialogComponent} from '../../../shared/dialogs/kri-data-add/kri-data-add.dialog.component';

@Component({
    selector: 'app-erm-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ErmService]
})
export class ErmHomeComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    alert: { type: 'success' | 'error', message: string } = {
        type: 'success',
        message: ''
    };
    showAlert: boolean = false;
    flashMessage: 'success' | 'error' | null = null;
    columns: string[] = ['id', 'kriName', 'period', 'value', 'status', 'details'];
    selectedKriDataForm: FormGroup;
    pagination: KriDataPagination;
    kriDatas$: Observable<KriData[]>;
    kriDatas: KriData[];
    selectedKriData: KriData | null = null;
    isLoading = true;
    kriDatasCount: number = 0;
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
        year: `${new Date().getFullYear()}`,
        size: 10,
        month: undefined,
        riskAreaId: undefined,
        kriId: undefined,
        id: '',
    };

    years = [
        `${new Date().getFullYear() - 2}`,
        `${new Date().getFullYear() - 1}`,
        `${new Date().getFullYear()}`
    ];
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

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fb: FormBuilder,
        private dialog: MatDialog,
        private _kriDataService: KriDataService,
        private _kriService: KriService,
        private _toartr: ToastrService,
    ) {
    }

    ngOnInit(): void {
        this.selectedKriDataForm = this._fb.group({
            id: [''],
            kriName: {disabled: true, value: ''},
            month: {disabled: true, value: ''},
            year: {disabled: true, value: ''},
            bau: {disabled: true, value: ''},
            trigger: {disabled: true, value: ''},
            rLimit: {disabled: true, value: ''},
            value: ['', [Validators.required]],
        });

        this._kriService.getMyGroupKris()
            .pipe(takeUntil(this._unsubscribeKriAll))
            .subscribe((res: any) => {
                this.kris = res.data;
                this._changeDetectorRef.markForCheck();
            });

        this.subscriberToButtonEvents();
        this.getData();
    }

    getData(): void {
        this._kriDataService.getMyGroupKriDatas(this.query).subscribe((res) => {
            this.kriDatasCount = res.data.length;
            this.kriDatas = res.data;
            this.pagination = res.pagination;
            this._changeDetectorRef.markForCheck();
            this.isLoading = false;
        });
    }

    toggleDetails(id: string): void {
        if (this.selectedKriData && this.selectedKriData.id === id) {
            this.closeDetails();
            return;
        }
        this._kriDataService.getMyGroupKriDataById(id)
            .subscribe((kriData) => {
                this.selectedKriData = kriData;
                this.selectedKriDataForm.patchValue(kriData);
                this._changeDetectorRef.markForCheck();
            });
    }

    getDate(month: string, year: string): Date {
        let date;
        if (parseInt(month, 10) < 10) {
            date = `0${month}-15-${year}`;
        } else {
            date = `${month}-15-${year}`;
        }
        return new Date(date);
    }

    closeDetails(): void {
        this.selectedKriData = null;
    }

    ngAfterViewInit(): void {}

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

    createKriData(): void {
        const dialogRef = this.dialog.open(KriDataAddDialogComponent, {data: {origin: 'home'}});
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this._kriDataService.createKriData(result)
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
                        (error) => {}
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
        this.getData();
    }

    getNextPage(e: PageEvent): void {
        this.query.page = e.pageIndex;
        this.query.size = e.pageSize;
        this.isLoading = true;
        this.getData();
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
                    this.getData();
                    return this._kriDataService.getMyGroupKriDatas(this.query);
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
                    return this._kriDataService.getMyGroupKriDatas(this.query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }
}
