import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Observable, Subject } from 'rxjs';
import {debounceTime, filter, switchMap, takeUntil} from 'rxjs/operators';
import {Kri, RiskArea} from '../kri.types';
import {KriService} from '../kri.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {KriAddDialogComponent} from '../../../../../shared/dialogs/kri-add/kri-add.dialog.component';
import { FuseAlertType } from '@fuse/components/alert';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

@Component({
    selector       : 'contacts-list',
    templateUrl    : './list.component.html',
    styleUrls      : ['./list.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KriListComponent implements OnInit, OnDestroy
{
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    alert: { type: FuseAlertType, message: string } = {
        type: 'success',
        message: ''
    };
    query = {
        sort: 'created_at',
        order: 'asc',
        q: undefined,
        page: 0,
        year: undefined,
        size: 10,
        month: undefined,
        riskAreaId: undefined,
        kriId: undefined,
        id: '',
    };
    showAlert: boolean = false;
    flashMessage: 'success' | 'error' | null = null;
    kris$: Observable<Kri[]>;

    krisCount: number = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    riskAreas: RiskArea[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedKri: Kri;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _krisService: KriService,
        private dialog: MatDialog,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get the contacts
        this.kris$ = this._krisService.kris$;
        this._krisService.kris$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((kris: Kri[]) => {

                // Update the counts
                this.krisCount = kris.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the contact
        this._krisService.kri$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((kri: Kri) => {

                // console.log('KRI', kri);
                // Update the selected contact
                this.selectedKri = kri;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the countries
        this._krisService.riskAreas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((riskAreas: RiskArea[]) => {
                // Update the countries
                this.riskAreas = riskAreas;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                debounceTime(500),
                takeUntil(this._unsubscribeAll),
                switchMap((query: string) => {
                    return this._krisService.searchKris({name: query});
                })
            )
            .subscribe((response) => {
                console.log(response);
                /*this._krisService.kris$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((kris: Kri[]) => {
                        // Update the counts
                        this.krisCount = kris.length;
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });*/
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if ( !opened )
            {
                // Remove the selected contact when drawer closed
                this.selectedKri = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode if the given breakpoint is active
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                }
                else
                {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>((event) => {
                    return (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                        && (event.key === '/'); // '/'
                })
            )
            .subscribe(() => {
                // this.createKri();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(0);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    private get _navBase(): ActivatedRoute {
        let r: ActivatedRoute = this._activatedRoute;
        while (r.firstChild) r = r.firstChild;
        return r.parent ?? this._activatedRoute;
    }

    goToKri(id: string): void {
        this._router.navigate(['./', id], { relativeTo: this._navBase });
        this._changeDetectorRef.markForCheck();
    }

    onBackdropClicked(): void {
        this._router.navigate(['..'], { relativeTo: this._navBase });
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create contact
     */
    /*createKri(): void
    {
        // Create the contact
        this._krisService.createKri().subscribe((newKri) => {

            // Go to new contact
            this.goToKri(newKri.id);
        });
    }*/

    /**
     * Get country code
     *
     * @param iso
     */
    /*getCountryCode(iso: string): string
    {
        if ( !iso )
        {
            return '';
        }

        return this.countries.find((country) => country.iso === iso).code;
    }*/

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.key || index;
    }

    createKri(): void {
        const dialogRef = this.dialog.open(KriAddDialogComponent, {});

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // console.log('result', result);
                // Get the product by id
                this._krisService.createKri(result)
                    .subscribe(
                        (kri) => {
                            if (kri instanceof HttpErrorResponse) {
                                this.alert.type = 'error';
                                this.alert.message = kri.error.message;
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
}
