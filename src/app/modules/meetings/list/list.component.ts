import {
    CommonModule,
    DOCUMENT,
} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Page, PageOptions, PageState } from 'app/shared/types/paging.types';
import { SearchOptions } from 'app/shared/types/searching.types';
import {
    BehaviorSubject,
    combineLatest,
    fromEvent,
    Observable,
    of,
    Subject,
} from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    startWith,
    switchMap,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';
import { MeetingsService } from '../meetings.service';
import { Meeting, MeetingTypeEnum } from '../meetings.types';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommitteesService } from 'app/modules/committees/committees.service';
import { BasicCommitteeDTO } from 'app/modules/committees/committees.types';
import { OrderOptionsEnum } from 'app/shared/types/order.types';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SortingService } from 'app/shared/services/sorting.service';
import { MatChipsModule } from '@angular/material/chips';
import { Organization } from 'app/modules/organizations/organizations.types';
import { OrganizationsService } from 'app/modules/organizations/organizations.service';

@Component({
    selector: 'meetings-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterOutlet,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatPaginatorModule,
        MatSidenavModule,
        MatMenuModule,
        MatDividerModule,
        MatSelectModule,
        MatDatepickerModule,
        MatTooltipModule,
        MatChipsModule,
    ],
    standalone: true,
})
export class MeetingsListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    meetings$: Observable<Meeting[]>;

    drawerMode: 'side' | 'over';
    selectedMeeting: Meeting;

    meetingsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    searchInputControl: FormControl = new FormControl();
    pageState: PageState = {
        page: 1,
        pageSize: 10,
        totalCount: 0,
    };

    OrderOptionsEnum = OrderOptionsEnum;
    private _paging = new BehaviorSubject<PageOptions>({
        page: 1,
        limit: 10,
        sort_order: 'desc',
        sort_field: 'starting_at',
    });

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
    meetingTypeEnum = MeetingTypeEnum;
    searchMeetingTypeControl: FormControl = new FormControl();
    meetingStartDateControl: FormControl = new FormControl();
    meetingEndDateControl: FormControl = new FormControl();
    searchArchivedMeetingControl: FormControl = new FormControl();
    committeeMeetingSearchControl: FormControl = new FormControl();
    committees$: Observable<BasicCommitteeDTO[]>;
    organizationMeetingSearchControl: FormControl = new FormControl();
    organizations$: Observable<Organization[]>;

    searchByMeetingNameControl: FormControl = new FormControl();
    searchByMeetingTitletControl: FormControl = new FormControl();
    searchByAgendaTitleControl: FormControl = new FormControl();
    searchByAgendaDescriptionControl: FormControl = new FormControl();
    sortKey: string = 'starting_at';
    sortOrder: string = 'desc';
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _meetingsService: MeetingsService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _changeRef: ChangeDetectorRef,
        private _committeesService: CommitteesService,
        private _organizationsService: OrganizationsService,
        private _sortingService: SortingService
    ) {}

    ngOnInit() {
        this.initMeetings();
        this.subscribeToPreselection();
        this.subscribeToDrawerCloseChanges();
        this.subscribeToMediaChanges();
        this.subscribeToCreateShortcut();
        this.committees$ = this._committeesService.getAllNonDeletedCommittees();
        this.organizations$ = this._organizationsService
            .getOrganizations(of({ page: 1, limit: 100 }))
            .pipe(map((res) => res.data));
    }

    private initMeetings() {
        const paging = this._paging.asObservable();
        const searching = this.getSearchChanges();
        this.meetings$ = this._meetingsService
            .getMeetings(paging, searching)
            .pipe(
                tap((page) => this.setPageState(page)),
                map((page) => page.data)
            );
    }

    /**
     * Returns an Observable that emits SearchOptions whenever any of the relevant search input changes.
     *
     * This method listens to changes on the following form controls:
     * - `searchInputControl`: The main search input, with debounced input to avoid excessive emissions.
     * - `searchMeetingTypeControl`: The control for selecting the type of meeting.
     * - `meetingEndDateControl`: The control for selecting the end date of the meeting.
     * - `meetingStartDateControl`: The control for selecting the start date of the meeting.
     *
     * It also ensures the date range (start date and end date) is only emitted when the end date is set.
     *
     * The emitted SearchOptions object contains:
     * - `search`: The current value of the main search input.
     * - `meeting_type`: The current value of the meeting type control.
     * - `startDate`: The start date of the meeting (or null if not set).
     * - `endDate`: The end date of the meeting (or null if not set).
     *
     * @returns {Observable<SearchOptions>} An Observable emitting the current search options.
     */
    private getSearchChanges(): Observable<SearchOptions> {
        const searchChanges$ = this.searchInputControl.valueChanges.pipe(
            startWith(this.searchInputControl.value),
            debounceTime(250),
            distinctUntilChanged()
        );

        const meetingTypeChanges$ =
            this.searchMeetingTypeControl.valueChanges.pipe(
                startWith(this.searchMeetingTypeControl.value)
            );

        const meetingEndDateChanges$ =
            this.meetingEndDateControl.valueChanges.pipe(
                startWith(this.meetingEndDateControl.value)
            );

        const meetingStartDateChanges$ =
            this.meetingStartDateControl.valueChanges.pipe(
                startWith(this.meetingStartDateControl.value)
            );

        const committeeMeetingChanges$ =
            this.committeeMeetingSearchControl.valueChanges.pipe(
                startWith(this.committeeMeetingSearchControl.value)
            );

        const organizationMeetingChanges$ =
            this.organizationMeetingSearchControl.valueChanges.pipe(
                startWith(this.organizationMeetingSearchControl.value)
            );

        const archivedMeetingChanges$ =
            this.searchArchivedMeetingControl.valueChanges.pipe(
                startWith(this.searchArchivedMeetingControl.value)
            );

        const meetingNameChanges$ =
            this.searchByMeetingNameControl.valueChanges.pipe(
                startWith(this.searchArchivedMeetingControl.value)
            );

        const meetingTitleChanges$ =
            this.searchByMeetingTitletControl.valueChanges.pipe(
                startWith(this.searchArchivedMeetingControl.value)
            );

        const agendaTitleChanges$ =
            this.searchByAgendaTitleControl.valueChanges.pipe(
                startWith(this.searchArchivedMeetingControl.value)
            );

        const agendaDescriptionChanges$ =
            this.searchByAgendaDescriptionControl.valueChanges.pipe(
                startWith(this.searchArchivedMeetingControl.value)
            );

        const dateRangeChanges$ = combineLatest([
            meetingStartDateChanges$,
            meetingEndDateChanges$,
        ]).pipe(map(([start_date, end_date]) => ({ start_date, end_date })));

        return combineLatest([
            searchChanges$,
            meetingTypeChanges$,
            dateRangeChanges$.pipe(
                startWith({ start_date: null, end_date: null })
            ),
            committeeMeetingChanges$,
            organizationMeetingChanges$,
            archivedMeetingChanges$,
            meetingNameChanges$,
            meetingTitleChanges$,
            agendaTitleChanges$,
            agendaDescriptionChanges$,
        ]).pipe(
            map(
                ([
                    search,
                    meeting_type,
                    { start_date, end_date },
                    committee_code,
                    organization_code,
                    is_deleted,
                    name,
                    title,
                    agenda_title,
                    agenda_full_description,
                ]) => ({
                    search,
                    meeting_type,
                    start_date,
                    end_date,
                    committee_code,
                    organization_code,
                    is_deleted,
                    name,
                    title,
                    agenda_title,
                    agenda_full_description,
                })
            ),
            tap(() => this._changeRef.markForCheck())
        );
    }

    private setPageState(page: Page<Meeting>) {
        this.pageState = {
            page: parseInt(page.page),
            pageSize: parseInt(page.limit),
            totalCount: page.count,
        };
    }

    private subscribeToPreselection() {
        this._activatedRoute.queryParams
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter((params) => !!params.select),
                switchMap((params) =>
                    this._meetingsService.getMeetingById(params.select)
                ),
                tap((meeting) => this.goToMeeting(meeting))
            )
            .subscribe();
    }

    private subscribeToDrawerCloseChanges() {
        this.matDrawer.closedStart
            .pipe(
                takeUntil(this._unsubscribeAll),
                tap(() => this.initMeetings())
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

    private subscribeToCreateShortcut() {
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>((event) => {
                    return (
                        (event.ctrlKey === true || event.metaKey) && // Ctrl or Cmd
                        event.key === '/'
                    ); // '/'
                })
            )
            .subscribe(() => {
                this.createMeeting();
            });
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    goToMeeting(meeting: Meeting) {
        this.selectedMeeting = meeting;
        this.navigateTo(['../', meeting.code]);
    }

    private navigateTo(path: any[]) {
        let route = this._activatedRoute;
        const navigationExtras = { state: { editMode: false } };
        while (route.firstChild) route = route.firstChild;
        path[0] = '/bosedr/meetings';
        this._router.navigate(path, { relativeTo: route, ...navigationExtras });
    }

    onBackdropClicked() {
        this.navigateTo(['../']);
    }

    createMeeting() {
        this.navigateTo(['../', 'new']);
    }

    trackByFn(index: number, item: any): any {
        return item.code || index;
    }

    onPage(event: PageEvent) {
        this._paging.next({
            page: event.pageIndex + 1,
            limit: event.pageSize,
            sort_order: this.sortOrder,
            sort_field: this.sortKey,
        });
    }

    get meetingTypeKeys() {
        return this._meetingsService.getMeetingTypeKeys();
    }

    closeMenu() {
        this.menuTrigger && this.menuTrigger.closeMenu();
    }

    /**
     * Toggles the sort order between ascending (ASC) and descending (DESC) on each call
     * and triggers the paging mechanism with the updated sort order.
     *
     * This method flips the current sorting order for meetings whenever it is invoked.
     * It achieves this by:
     * 1. Checking the current sort order.
     * 2. Switching it to the opposite order (ASC to DESC or DESC to ASC).
     * 3. Updating the paging parameters with the new sort order.
     *
     * The paging update is handled by emitting a new paging state object through
     * the `_paging` subject, which includes the current page, page size, and the
     * toggled sort order.
     */
    sortMeetings() {
        this.sortOrder = this._sortingService.sortEntities(
            this.pageState,
            this._paging,
            this.sortOrder,
            this.sortKey
        );
    }

    goToTrails(event: Event, meeting: Meeting) {
        event.stopPropagation();
        this._router.navigate([`bosedr/meetings/${meeting?.code}/trails`]);
    }

    resetFilters(): void {
        this.searchArchivedMeetingControl.reset('');
        this.searchMeetingTypeControl.reset('');
        this.committeeMeetingSearchControl.reset('');
        this.organizationMeetingSearchControl.reset('');
        this.searchInputControl.reset('');
        this.meetingStartDateControl.reset(null);
        this.meetingEndDateControl.reset(null);
        this.searchByMeetingNameControl.reset(null);
        this.searchByMeetingTitletControl.reset(null);
        this.searchByAgendaTitleControl.reset(null);
        this.searchByAgendaDescriptionControl.reset(null);
    }

    setSort(key: string): void {
        if (this.sortKey === key) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortKey = key;
            this.sortOrder = 'asc';
        }
        this.sortMeetings();
    }
}
