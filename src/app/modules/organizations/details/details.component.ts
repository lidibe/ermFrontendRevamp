import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterLink,
} from '@angular/router';
import { Subject } from 'rxjs';
import { Organization } from '../organizations.types';
import { OrganizationsListComponent } from '../list/list.component';
import { OrganizationsService } from '../organizations.service';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { MatDividerModule } from '@angular/material/divider';
import { DialogConfigService } from 'app/shared/services/dialog-config.service';
import { ConfirmDeleteDialogComponent } from 'app/shared/components/confirml-delete-dialog/confirm-delete-dialog.component';
import { EntityTypeEnum } from 'app/shared/models/entity-type.enum';
import { QuillModule } from 'ngx-quill';

@Component({
    selector: 'organization-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        RouterLink,
        ReactiveFormsModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDividerModule,
        AsyncPipe,
        QuillModule,
    ],
    standalone: true,
})
export class OrganizationsDetailsComponent implements OnInit, OnDestroy {
    organization: Organization;
    form: FormGroup;
    editMode = false;
    isNewOrganization = false;
    quillModules = {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
      ],
    };
    private _unsubscribeAll = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _organizationsListComponent: OrganizationsListComponent,
        private _organizationsService: OrganizationsService,
        private _dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _dialogConfigService: DialogConfigService
    ) {}

    ngOnInit() {
        this.initComponentData();
        this.initForm();
        this.openDrawer();
        this.subscribeToRouterStateChanges();
    }

    subscribeToRouterStateChanges() {
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                const state = this._router.getCurrentNavigation()?.extras.state;
                if (state && state['editMode'] !== undefined) {
                    this.editMode = state['editMode'];
                } else {
                    this.editMode = this.isNewOrganization;
                }
            });
    }

    private initComponentData() {
        this.initEditMode();
        this._activatedRoute.data
            .pipe(
                takeUntil(this._unsubscribeAll),
                tap((data) => this.initFromRouteData(data)),
                tap(() => this._changeDetectorRef.markForCheck())
            )
            .subscribe();
    }

    private initEditMode() {
        this.isNewOrganization =
            this._activatedRoute.snapshot.paramMap.get('id') === 'new';
        this.editMode = this.isNewOrganization;
    }

    private initFromRouteData(data: any) {
        this.initOrganization(data);
    }

    private initOrganization(data: any) {
        this.organization = data.organization;
    }

    private initForm() {
        this.form = this._formBuilder.group({
            _id: [''],
            code: [''],
            name: ['', Validators.required],
            description: [''],
        });
    }

    private initFormForUpdates() {
        this.form.patchValue(this.organization);
    }

    private openDrawer() {
        this._organizationsListComponent.matDrawer.open();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._organizationsListComponent.matDrawer.close();
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        !this.isNewOrganization && this.initFormForUpdates();
    }

    saveOrganization() {
        const organization = this.form.value as Organization;
        const savedOrganization = this.isNewOrganization
            ? this._organizationsService.createOrganization(organization)
            : this._organizationsService.updateOrganization(organization);
        savedOrganization
            .pipe(
                take(1),
                tap((organization) => this.finaliseSumbission(organization))
            )
            .subscribe();
    }

    private finaliseSumbission(organization: Organization) {
        if (this.isNewOrganization) this.finaliseCreate(organization);
        else this.finaliseUpdate();
    }

    private finaliseCreate(organization: Organization) {
        this._router.navigate(['../'], {
            queryParams: { select: organization?.code },
            relativeTo: this._activatedRoute,
        });
        this._changeDetectorRef.markForCheck();
    }

    private finaliseUpdate() {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        this.closeDrawer();
        this._changeDetectorRef.markForCheck();
    }

    async deleteOrganization() {
        if (this.isNewOrganization) return;

        const dialogConfig = await this._dialogConfigService.getDialogConfig(
            EntityTypeEnum.ORGANIZATION
        );

        this._dialog
            .open(ConfirmDeleteDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                switchMap((reason) =>
                    this._organizationsService.deleteOrganizationById(
                        this.organization?.code,
                        reason
                    )
                ),
                tap((organization) => this.finaliseSumbission(organization)),
                tap(() => this._changeDetectorRef.markForCheck())
            )
            .subscribe();
        this._changeDetectorRef.markForCheck();
    }

    unArchiveOrganization() {
        this._organizationsService
            .unArchiveOrganization(this.organization?.code)
            .pipe(
                take(1),
                tap(() => this.finaliseUpdate())
            )
            .subscribe();
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByCode(index: number, item: any): any {
        return item?.code || index;
    }
}
