import {
    AsyncPipe,
    I18nPluralPipe,
    NgClass,
    NgFor,
    NgIf,
} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    finalize,
    map,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Page, PageOptions, PageState } from 'app/shared/types/paging.types';
import { SearchOptions } from 'app/shared/types/searching.types';
import { OrderOptionsEnum } from 'app/shared/types/order.types';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SortingService } from 'app/shared/services/sorting.service';
import { MatChipsModule } from '@angular/material/chips';
import { Organization } from '../organizations.types';
import { OrganizationsService } from '../organizations.service';

@Component({
    selector: 'organizations-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        RouterOutlet,
        NgIf,
        NgFor,
        NgClass,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatTooltipModule,
        AsyncPipe,
        I18nPluralPipe,
        MatChipsModule,
    ],
})
export class OrganizationsListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    selectedOrganization: Organization;

    isOrganizationsLoading = false;
    pageState: PageState = {
        page: 1,
        pageSize: 10,
        totalCount: 0,
    };
    searchInputControl = new FormControl();

    organizations$: Observable<Organization[]>;

    orderOptionsEnum = OrderOptionsEnum;
    public sortOrder: OrderOptionsEnum = OrderOptionsEnum.DESC; // Initial sort order

    private _paging = new BehaviorSubject<PageOptions>({
        page: 1,
        limit: 10,
        sort_order: this.sortOrder,
    });

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeRef: ChangeDetectorRef,
        private _organizationsService: OrganizationsService,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _sortingService: SortingService
    ) {}

    ngOnInit() {
        this.initOrganizations();
        this.subscribeToPreselection();
        this.subscribeToDrawerCloseChanges();
        this.subscribeToMediaChanges();
    }

    private initOrganizations() {
        this.isOrganizationsLoading = true;
        const paging = this._paging.asObservable();
        const searching = this.getSearchChanges();
        this.organizations$ = this._organizationsService
            .getOrganizations(paging, searching)
            .pipe(
                tap((page) => this.setPageState(page)),
                map((page) => page.data),
                finalize(() => (this.isOrganizationsLoading = false))
            );
        this._changeRef.markForCheck();
    }

    private subscribeToPreselection() {
        this._activatedRoute.queryParams
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter((params) => !!params.select),
                switchMap((params) =>
                    this._organizationsService.getOrganizationById(
                        params.select
                    )
                ),
                tap((Organization) => this.goToOrganization(Organization))
            )
            .subscribe();
    }

    private getSearchChanges(): Observable<SearchOptions> {
        return this.searchInputControl.valueChanges.pipe(
            debounceTime(250),
            distinctUntilChanged(),
            map((search) => ({ search })),
            tap(() => this._changeRef.markForCheck())
        );
    }

    private setPageState(page: Page<Organization>) {
        this.pageState = {
            page: parseInt(page.page),
            pageSize: parseInt(page.limit),
            totalCount: page.count,
        };
    }

    private subscribeToDrawerCloseChanges() {
        this.matDrawer.closedStart
            .pipe(
                takeUntil(this._unsubscribeAll),
                tap(() => this.initOrganizations())
            )
            .subscribe();
    }

    private subscribeToMediaChanges() {
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.drawerMode = matchingAliases.includes('lg')
                    ? 'side'
                    : 'over';
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    createOrganization() {
        this.navigateTo(['../', 'new']);
    }

    private navigateTo(path: any[]) {
        let route = this._activatedRoute;
        const navigationExtras = { state: { editMode: false } };
        while (route.firstChild) route = route.firstChild;
        path[0] = '/bosedr/organizations';
        this._router.navigate(path, { relativeTo: route, ...navigationExtras });
    }

    goToOrganization(Organization: Organization) {
        this.selectedOrganization = Organization;
        this.navigateTo(['../', Organization.code]);
    }

    onBackdropClicked() {
        this.navigateTo(['../']);
    }

    onPage(event: PageEvent) {
        this._paging.next({
            page: event.pageIndex + 1,
            limit: event.pageSize,
            sort_order: this.sortOrder,
        });
    }

    trackByOrganizationCode(index: number, item: any): any {
        return item.code || index;
    }

    sortOrganizations() {
        this.sortOrder = this._sortingService.sortEntities(
            this.pageState,
            this._paging,
            this.sortOrder
        );
    }

    goToTrails(event: Event, Organization: Organization) {
        event.stopPropagation();
        this._router.navigate([
            `bosedr/organizations/${Organization?.code}/trails`,
        ]);
    }
}
