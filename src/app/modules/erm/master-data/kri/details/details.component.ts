import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {KriListComponent} from '../list/list.component';
import {KriService} from '../kri.service';
import {Kri, RiskArea} from '../kri.types';
import { UserGroupsService } from 'app/modules/admin/user-groups/user-groups.service';
import { Group } from 'app/modules/admin/user-groups/user-groups.types';
import { FuseAlertType } from '@fuse/components/alert';

@Component({
    selector       : 'contacts-details',
    templateUrl    : './details.component.html',
    styleUrls      : ['./details.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KriDetailsComponent implements OnInit, OnDestroy
{
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    alert: { type: FuseAlertType, message: string } = {
        type: 'success',
        message: ''
    };
    showAlert: boolean = false;
    flashMessage: 'success' | 'error' | null = null;

    editMode: boolean = false;

    kri: Kri;
    kriForm: FormGroup;
    kris: Kri[];
    userGroups: Group[];
    riskAreas: RiskArea[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _krisListComponent: KriListComponent,
        private _kriService: KriService,
        private _userGroupService: UserGroupsService,
        private _formBuilder: FormBuilder,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
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
        // Open the drawer
        this._krisListComponent.matDrawer.open();

        // Create the contact form
        this.kriForm = this._formBuilder.group({
            id: ['', [Validators.required]],
            riskAreaId: [''],
            // key: new FormControl({ disabled: true}, Validators.required),
            key: ['', [Validators.required]],
            name: ['', [Validators.required]],
            ownerGroup: [''],
            description: [''],
            tl: [''],
            nature: ['', [Validators.required]],
            frequency: ['', [Validators.required]],
            createdAt: [''],
            updatedAt: [''],
            deletedAt: [''],
        });

        // Get the contacts
        this._kriService.kris$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((kris: Kri[]) => {
                this.kris = kris;
                this._changeDetectorRef.markForCheck();
            });

        this._userGroupService.getGroups()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((userGroups: Array<Group>) => {
                this.userGroups = userGroups;
                this._changeDetectorRef.markForCheck();
            });

        // Get the contact
        this._kriService.kri$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((kri: Kri) => {

                // Open the drawer in case it is closed
                this._krisListComponent.matDrawer.open();

                // Get the contact
                this.kri = kri;

                // Patch values to the form
                this.kriForm.patchValue(kri);

                // Toggle the edit mode off
                this.toggleEditMode(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the country telephone codes
        this._kriService.riskAreas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((riskAreas: RiskArea[]) => {
                this.riskAreas = riskAreas;

                // Mark for check
                this._changeDetectorRef.markForCheck();
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

        // Dispose the overlays if they are still on the DOM
        if ( this._tagsPanelOverlayRef )
        {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._krisListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Update the contact
     */
    updateKri(): void
    {
        // Get the contact object
        const kri = this.kriForm.getRawValue();

        // Update the contact on the server
        this._kriService.updateKri(kri.id, kri).subscribe(() => {

            // Toggle the edit mode off
            this.toggleEditMode(false);
        });
    }

    /**
     * Open tags panel
     */
    openTagsPanel(): void
    {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass   : '',
            hasBackdrop     : true,
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                                  .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                                  .withFlexibleDimensions()
                                  .withViewportMargin(64)
                                  .withLockedPosition()
                                  .withPositions([
                                      {
                                          originX : 'start',
                                          originY : 'bottom',
                                          overlayX: 'start',
                                          overlayY: 'top'
                                      }
                                  ])
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() => {

            // Add a class to the origin
            this._renderer2.addClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement.querySelector('input').focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {

            // Remove the class from the origin
            this._renderer2.removeClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // If overlay exists and attached...
            /*if ( this._tagsPanelOverlayRef && this._tagsPanelOverlayRef.hasAttached() )
            {
                // Detach it
                this._tagsPanelOverlayRef.detach();

                // Reset the tag filter
                this.filteredTags = this.tags;

                // Toggle the edit mode off
                this.tagsEditMode = false;
            }*/

            // If template portal exists and attached...
            if ( templatePortal && templatePortal.isAttached )
            {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
