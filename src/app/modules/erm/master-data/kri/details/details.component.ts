import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { KriListComponent } from '../list/list.component';
import { KriService } from '../kri.service';
import { Kri, RiskArea } from '../kri.types';
import { UserGroupsService } from 'app/modules/admin/user-groups/user-groups.service';
import { Group } from 'app/modules/admin/user-groups/user-groups.types';

@Component({
    selector: 'contacts-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KriDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    showAlert = false;
    flashMessage: 'success' | 'error' | null = null;

    editMode = false;

    kri: Kri;
    kriForm: FormGroup;
    kris: Kri[];
    userGroups: Group[];
    riskAreas: RiskArea[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

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
    ) {}

    ngOnInit(): void {
        this._krisListComponent.matDrawer.open();

        this.kriForm = this._formBuilder.group({
            id: ['', [Validators.required]],
            riskAreaId: [''],
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

        this._kriService.kris$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((kris: Kri[]) => {
                this.kris = kris;
                this._changeDetectorRef.markForCheck();
            });

        this._userGroupService.getGroups()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((userGroups: Group[]) => {
                this.userGroups = userGroups;
                this._changeDetectorRef.markForCheck();
            });

        this._kriService.kri$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((kri: Kri) => {
                this._krisListComponent.matDrawer.open();
                this.kri = kri;
                this.kriForm.patchValue(kri);
                this.toggleEditMode(false);
                this._changeDetectorRef.markForCheck();
            });

        this._kriService.riskAreas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((riskAreas: RiskArea[]) => {
                this.riskAreas = riskAreas;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(0);
        this._unsubscribeAll.complete();

        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._krisListComponent.matDrawer.close();
    }

    toggleEditMode(editMode: boolean | null = null): void {
        this.editMode = editMode === null ? !this.editMode : editMode;
        this._changeDetectorRef.markForCheck();
    }

    updateKri(): void {
        const kri = this.kriForm.getRawValue();
        this._kriService.updateKri(kri.id, kri).subscribe(() => {
            this.toggleEditMode(false);
            this.flashMessage = 'success';
            this._changeDetectorRef.markForCheck();
            setTimeout(() => {
                this.flashMessage = null;
                this._changeDetectorRef.markForCheck();
            }, 2000);
        }, () => {
            this.flashMessage = 'error';
            this._changeDetectorRef.markForCheck();
            setTimeout(() => {
                this.flashMessage = null;
                this._changeDetectorRef.markForCheck();
            }, 2000);
        });
    }

    openTagsPanel(): void {
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                .withFlexibleDimensions()
                .withViewportMargin(64)
                .withLockedPosition()
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top'
                    }
                ])
        });

        this._tagsPanelOverlayRef.attachments().subscribe(() => {
            this._renderer2.addClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');
            this._tagsPanelOverlayRef.overlayElement.querySelector('input')?.focus();
        });

        const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);
        this._tagsPanelOverlayRef.attach(templatePortal);

        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {
            this._renderer2.removeClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');
            if (templatePortal && templatePortal.isAttached) {
                templatePortal.detach();
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
