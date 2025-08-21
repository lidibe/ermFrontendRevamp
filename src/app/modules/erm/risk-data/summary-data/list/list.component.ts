import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { SummaryData, RiskArea } from '../summary-data.types';
import { SummaryDataService } from '../summary-data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { FuseAlertType } from '@fuse/components/alert';
import { SummaryDataAddDialogComponent } from '../../../../../shared/dialogs/summary-data-add/summary-data-add.dialog.component';

@Component({
    selector: 'summary-data-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryDataListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    showAlert = false;
    flashMessage: 'success' | 'error' | null = null;

    summaryDatas$: Observable<SummaryData[]>;
    summaryDataCount = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    riskAreas: RiskArea[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedSummaryData: SummaryData;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _summaryDataService: SummaryDataService,
        private dialog: MatDialog,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    ngOnInit(): void {
        this.summaryDatas$ = this._summaryDataService.summaryDatas$;

        this._summaryDataService.summaryDatas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((summaryDatas: SummaryData[]) => {
                this.summaryDataCount = summaryDatas.length;
                this._changeDetectorRef.markForCheck();
            });

        this._summaryDataService.summaryData$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((kri: SummaryData) => {
                this.selectedSummaryData = kri;
                this._changeDetectorRef.markForCheck();
            });

        this._summaryDataService.riskAreas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((riskAreas: RiskArea[]) => {
                this.riskAreas = riskAreas;
                this._changeDetectorRef.markForCheck();
            });

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap((query) => this._summaryDataService.searchSummaryDatas(query))
            )
            .subscribe();

        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                this.selectedSummaryData = null;
                this._changeDetectorRef.markForCheck();
            }
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.drawerMode = matchingAliases.includes('lg') ? 'side' : 'over';
                this._changeDetectorRef.markForCheck();
            });

        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>((event) => (event.ctrlKey === true || event.metaKey) && event.key === '/')
            )
            .subscribe(() => {});
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(0);
        this._unsubscribeAll.complete();
    }

  private get _navBase(): ActivatedRoute {
    let r: ActivatedRoute = this._activatedRoute;
    while (r.firstChild) r = r.firstChild;
    return r.parent ?? this._activatedRoute;
  }

  goToSummaryData(id: string): void {
    this._router.navigate(['./', id], { relativeTo: this._navBase });
    this._changeDetectorRef.markForCheck();
  }

  onBackdropClicked(): void {
    this._router.navigate(['..'], { relativeTo: this._navBase });
    this._changeDetectorRef.markForCheck();
  }

    trackByFn(index: number, item: any): any {
        return item.key || index;
    }

    getMonth(month: string): string {
        let ret;
        switch (month) {
            case '1':
                ret = 'January';
                break;
            case '2':
                ret = 'February';
                break;
            case '3':
                ret = 'March';
                break;
            case '4':
                ret = 'April';
                break;
            case '5':
                ret = 'May';
                break;
            case '6':
                ret = 'June';
                break;
            case '7':
                ret = 'July';
                break;
            case '8':
                ret = 'August';
                break;
            case '9':
                ret = 'September';
                break;
            case '10':
                ret = 'October';
                break;
            case '11':
                ret = 'November';
                break;
            case '12':
                ret = 'December';
                break;
        }
        return ret!;
    }

    createSummaryData(): void {
        const dialogRef = this.dialog.open(SummaryDataAddDialogComponent, {});
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._summaryDataService.createSummaryData(result).subscribe(
                    (obj) => {
                        if (obj instanceof HttpErrorResponse) {
                            this.alert.type = 'error';
                            this.alert.message = obj.error.message;
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
}
