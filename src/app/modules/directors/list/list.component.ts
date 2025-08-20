import { AsyncPipe, DOCUMENT, I18nPluralPipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Page, PageOptions, PageState } from 'app/shared/types/paging.types';
import { SearchOptions } from 'app/shared/types/searching.types';
import { BehaviorSubject, combineLatest, fromEvent, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import {Country, Director, DirectorClass} from "../directors.types";
import {DirectorsService} from "../directors.service";
import { FuseMediaWatcherService } from '@fuse/services/media-watcher/media-watcher.service';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { OrganizationEnum } from 'app/shared/models/organization.enum';
import { MatSelectModule } from '@angular/material/select';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OrderOptionsEnum } from 'app/shared/types/order.types';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SortingService } from 'app/shared/services/sorting.service';
import { ISOCountryService } from 'app/shared/services/iso-country.service';
import { Organization } from 'app/modules/organizations/organizations.types';
import { OrganizationsService } from 'app/modules/organizations/organizations.service';

@Component({
    selector: 'directors-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf, NgFor, NgClass,
        ReactiveFormsModule, RouterOutlet,
        MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatChipsModule, MatPaginatorModule,
        MatDatepickerModule, MatSidenavModule, MatSelectModule, MatMenuModule, MatDividerModule, MatTooltipModule,
        AsyncPipe, TitleCasePipe, I18nPluralPipe],
        standalone     : true   
})
export class DirectorsListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    directors$: Observable<Director[]>;

    directorsCount: number = 0;
    directorsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    countries: Country[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    searchDirectorTypeControl: FormControl = new FormControl();
    searchDirectorStatusControl: FormControl = new FormControl();
    searchArchivedDirectorControl: FormControl = new FormControl();
    directorStartTermControl: FormControl = new FormControl();
    directorEndTermControl: FormControl = new FormControl();
    directorClassControl: FormControl = new FormControl();
    selectedDirector: Director;
    directorClassesByCode: Record<string, DirectorClass>;
    searchOrganizationControl: FormControl = new FormControl();

    pageState: PageState = {
        page: 1,
        pageSize: 10,
        totalCount: 0,
    };

    OrderOptionsEnum = OrderOptionsEnum;
    public sortOrder: OrderOptionsEnum = OrderOptionsEnum.DESC; // Initial sort order
    
    private _paging = new BehaviorSubject<PageOptions>({ page: 1, limit: 10, sort_order: this.sortOrder });

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public organizationEnum = OrganizationEnum;
    directorTypes$: Observable<string[]>;
    directorStatus$: Observable<string[]>;
    directorClasses$: Observable<DirectorClass[]>;
    @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
    organizations$: Observable<Organization[]>;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeRef: ChangeDetectorRef,
        private _directorsService: DirectorsService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _sortingService: SortingService,
        private _isoCountryService: ISOCountryService,
        private _organizationsService: OrganizationsService
    ) { }

    ngOnInit() {
        this.organizations$ = this._organizationsService.getOrganizations(of({page: 1, limit:100})).pipe(map(res => res.data))
        this.initDirectors();
        this.initDirectorClasses();
        this.initCountries();
        this.subscribeToPreselection();
        this.subscribeToDrawerCloseChanges();
        this.subscribeToMediaChanges();
        this.subscribeToCreateShortcut();
        this.directorTypes$ = this._directorsService.getDirectorTypes();
        this.directorStatus$ = this._directorsService.getDirectorStatus();
        this.directorClasses$ = this._directorsService.getDirectorClasses();
    }

    private initDirectors() {
        const paging = this._paging.asObservable();
        const searching = this.getSearchChanges();
        this.directors$ = this._directorsService.getDirectors(paging, searching)
            .pipe(
                tap(page => this.setPageState(page)),
                map(page => page.data),
            );
    }

    /**
     * Generates an observable that combines the latest values from various form controls
     * to create search options for querying the backend.
     * 
     * The method listens to changes in multiple form controls:
     * - searchInputControl: for the search input text.
     * - searchDirectorTypeControl: for filtering by director type.
     * - searchDirectorStatusControl: for filtering by director status.
     * - searchArchivedDirectorControl: for filtering by archival status.
     * - directorClassControl: for filtering by director class.
     * - directorStartTermControl: for filtering by start date of director term.
     * - directorEndTermControl: for filtering by end date of director term.
     * 
     * These controls' values are combined using the combineLatest operator.
     * The dateRangeChanges$ observable ensures that start and end dates are processed together.
     * The resulting search options object is emitted whenever any of the form controls change.
     * 
     * @returns {Observable<SearchOptions>} An observable emitting the current search options.
    */
    private getSearchChanges(): Observable<SearchOptions> {
    const createValueChangeStream = (control: FormControl) => control.valueChanges.pipe(
      startWith(control.value)
    );
  
    const searchChanges$ = this.searchInputControl.valueChanges.pipe(
      startWith(this.searchInputControl.value),
      debounceTime(250),
      distinctUntilChanged()
    );
  
    const directorTypeChanges$ = createValueChangeStream(this.searchDirectorTypeControl);
    const directorStatusChanges$ = createValueChangeStream(this.searchDirectorStatusControl);
    const directorArchiveChanges$ = createValueChangeStream(this.searchArchivedDirectorControl);
    const directorClassChanges$ = createValueChangeStream(this.directorClassControl);
    const directorStartTermChanges$ = createValueChangeStream(this.directorStartTermControl);
    const directorEndTermChanges$ = createValueChangeStream(this.directorEndTermControl);
    const directorOrganizationChanges$ = createValueChangeStream(this.searchOrganizationControl);
  
    const dateRangeChanges$ = directorEndTermChanges$.pipe(
      withLatestFrom(directorStartTermChanges$),
      map(([end_date, start_date]) => ({ start_date, end_date }))
    );
  
    return combineLatest([
      searchChanges$,
      directorTypeChanges$,
      directorStatusChanges$,
      directorArchiveChanges$,
      directorClassChanges$,
      dateRangeChanges$.pipe(startWith({ start_date: null, end_date: null })),
      directorOrganizationChanges$
    ]).pipe(
      map(([search, director_type, status, is_deleted, shareholding_class, { start_date, end_date }, organizationCode]) => ({
        search,
        director_type,
        status,
        is_deleted,
        shareholding_class,
        start_date: start_date || null,
        end_date: end_date || null,
        organizationCode
      })),
      tap(() => this._changeRef.markForCheck())
    );
  }
  
    private setPageState(page: Page<Director>) {
        this.pageState = {
            page: parseInt(page.page),
            pageSize: parseInt(page.limit),
            totalCount: page.count,
        };
    }

    private initCountries() {
        this.countries = this._activatedRoute.snapshot.data.countries;
        this._isoCountryService.countries = this.countries;
    }

    private initDirectorClasses() {
        const directorClasses = this._activatedRoute.snapshot.data.classes;
        this.directorClassesByCode = directorClasses
            .reduce((byCode, directorClass) => {
                byCode[directorClass.code] = directorClass;
                return byCode;
            }, { });
    }

    private subscribeToPreselection() {
        this._activatedRoute.queryParams.pipe(
            takeUntil(this._unsubscribeAll),
            filter(params => !!params.select),
            switchMap(params => this._directorsService.getDirectorById(params.select)),
            tap(director => this.goToDirector(director)),
        )
        .subscribe();
    }

    private subscribeToDrawerCloseChanges() {
        this.matDrawer.closedStart
        .pipe(
            takeUntil(this._unsubscribeAll),
            tap(() => this.initDirectors()),
        )
        .subscribe();
    }

    private subscribeToMediaChanges() {
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.drawerMode = matchingAliases.includes('lg') ? 'side' : 'over';
            });
    }

    private subscribeToCreateShortcut() {
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>((event) => {
                    return (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                        && (event.key === '/'); // '/'
                })
            )
            .subscribe(() => {
                this.createDirector();
            });
    }

    ngOnDestroy() {
        // this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    goToTrails(event: Event, director: Director) {
        event.stopPropagation();
        this._router.navigate([`bosedr/directors/${director?.code}/trails`])
    }

    goToDirector(director: Director) {
        this.selectedDirector = director;
        this.navigateTo(['../', director.code]);
    }

    private navigateTo(path: any[]) {
        let route = this._activatedRoute;
        const navigationExtras = { state: { editMode: false } }
        while (route.firstChild)
            route = route.firstChild;
        path[0] = '/bosedr/directors'
        this._router.navigate(path, { relativeTo: route, ...navigationExtras });
    }

    onBackdropClicked() {
        this.navigateTo(['../']);
    }

    createDirector() {
        this.navigateTo(['../', 'new']);
    }

    getCountryCode(iso?: string): string {
        if (!iso) return '';
        return this.countries.find((country) => country.iso === iso).code;
    }

    getCountryByIso(iso: string | string[]): Country {
        return this._isoCountryService.getCountryByIso(iso);
    }

    trackByFn(index: number, item: any): any {
        return item.code || index;
    }

    onPage(event: PageEvent) {
        this._paging.next({
            page: event.pageIndex + 1,
            limit: event.pageSize,
            sort_order: this.sortOrder
        });
    }

    getDirectorClassForChip(classCode: string): string {
        const directorClass = this.directorClassesByCode[classCode];
        if (!directorClass || !directorClass.label) return 'Class unknown';
        const label = directorClass.label;
        return label.length === 1
            ? `Class ${label}`
            : label;
    }

    closeMenu() {
        this.menuTrigger && this.menuTrigger.closeMenu();
    }

    resetFilters(): void {
        
        const controlsToReset: FormControl[] = [
          this.searchDirectorTypeControl,
          this.searchDirectorStatusControl,
          this.searchArchivedDirectorControl,
          this.directorClassControl,
          this.directorStartTermControl,
          this.directorEndTermControl,
          this.searchInputControl,
          this.searchOrganizationControl];
        
          controlsToReset.forEach(control => control.reset(''));
      }

      sortDirectors() {
        this.sortOrder = this._sortingService.sortEntities(this.pageState, this._paging, this.sortOrder);
      }

      get organizationKeys() {
        return Object.keys(this.organizationEnum);
      }
}
