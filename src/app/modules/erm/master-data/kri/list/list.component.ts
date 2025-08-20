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
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Kri, RiskArea } from '../kri.types';
import { KriService } from '../kri.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { FuseAlertType } from '@fuse/components/alert';
import { KriAddDialogComponent } from '../../../../../shared/dialogs/kri-add/kri-add.dialog.component';

@Component({
    selector: 'contacts-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KriListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };

    query = {
        sort: 'created_at',
        order: 'asc' as 'asc' | 'desc' | '',
        q: undefined as string | undefined,
        page: 0,
        year: undefined as string | undefined,
        size: 10,
        month: undefined as string | undefined,
        riskAreaId: undefined as string | undefined,
        kriId: undefined as string | undefined,
        id: ''
    };

    showAlert = false;
    flashMessage: 'success' | 'error' | null = null;

    kris$: Observable<Kri[]>;
    krisCount = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    riskAreas: RiskArea[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedKri: Kri;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _krisService: KriService,
        private dialog: MatDialog,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    ngOnInit(): void {
        this.kris$ = this._krisService.kris$;

        this._krisService.kris$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((kris: Kri[]) => {
                this.krisCount = kris.length;
                this._changeDetectorRef.markForCheck();
            });

        this._krisService.kri$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((kri: Kri) => {
                this.selectedKri = kri;
                this._changeDetectorRef.markForCheck();
            });

        this._krisService.riskAreas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((riskAreas: RiskArea[]) => {
                this.riskAreas = riskAreas;
                this._changeDetectorRef.markForCheck();
            });

        this.searchInputControl.valueChanges
            .pipe(
                debounceTime(500),
                takeUntil(this._unsubscribeAll),
                switchMap((query: string) => this._krisService.searchKris({ name: query }))
            )
            .subscribe(() => {});

        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                this.selectedKri = null;
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
                filter<KeyboardEvent>((event) => {
                    return (event.ctrlKey === true || event.metaKey) && event.key === '/';
                })
            )
            .subscribe(() => {});
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(0);
        this._unsubscribeAll.complete();
    }

    goToKri(id: string): void {
        let route = this._activatedRoute;
        while (route.firstChild) {
            route = route.firstChild;
        }
        this._router.navigate(['../', id], { relativeTo: route });
        this._changeDetectorRef.markForCheck();
    }

    onBackdropClicked(): void {
        let route = this._activatedRoute;
        while (route.firstChild) {
            route = route.firstChild;
        }
        this._router.navigate(['../'], { relativeTo: route });
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.key || index;
    }

    createKri(): void {
        const dialogRef = this.dialog.open(KriAddDialogComponent, {});
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._krisService.createKri(result).subscribe(
                    (kri) => {
                        if (kri instanceof HttpErrorResponse) {
                            this.alert.type = 'error';
                            this.alert.message = kri.error.message;
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
