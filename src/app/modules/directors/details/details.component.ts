import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { Committee } from 'app/modules/committees/committees.types';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import {
    AccountDetail,
    Country,
    Director,
    DirectorClass,
    DirectorLanguage, DirectorStatus, DirectorTerm,
    DirectorTitle,
    DirectorType,
    IdCard,
    RouteResolvedDirectorData
} from "../directors.types";
import {DirectorsListComponent} from "../list/list.component";
import {DirectorsService} from "../directors.service";
import {AddDirectorsAddressDialogComponent} from "../add-address-dialog/add-directors-address-dialog.component";
import {AddDirectorsAssistantDialogComponent} from "../add-assistant-dialog/add-assistant-address-dialog.component";
import {AddDirectorsDocumentDialogComponent} from "../add-document-dialog/add-document-dialog.component";
import {
    AddDirectorsDocumentDocumentDialogComponent
} from "../add-document-document-dialog/add-document-document-dialog.component";
import {AddDirectorsTermDialogComponent} from "../add-term-dialog/add-term-dialog.component";
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgFor, NgIf, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateAdapter, MAT_DATE_FORMATS, MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DialogConfigService } from 'app/shared/services/dialog-config.service';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { PATTERNS_CONSTANTS } from 'app/shared/constants/app-constants';
import { AddBankDetailsDialogComponent } from '../add-bank-details-dialog/add-bank-details-dialog.component';
import { atLeastOneRequired, maxSelectionValidator } from 'app/shared/validators/custom-validators';
import { ConfirmDeleteDialogComponent } from 'app/shared/components/confirml-delete-dialog/confirm-delete-dialog.component';
import { EntityTypeEnum } from 'app/shared/models/entity-type.enum';
import { ISOCountryService } from 'app/shared/services/iso-country.service';
import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
  } from '@angular/material/snack-bar';
import { City } from 'app/shared/models/city.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { IdCardDetailsComponent } from '../id-card-details/id-card-details.component';
import { Organization } from 'app/modules/organizations/organizations.types';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { OrganizationsService } from 'app/modules/organizations/organizations.service';
import { CommitteesService } from 'app/modules/committees/committees.service';

@Component({
    selector: 'directors-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        // Material Date Adapter
        {
            provide : DateAdapter,
            useClass: LuxonDateAdapter,
        },
        {
            provide : MAT_DATE_FORMATS,
            useValue: {
                parse  : {
                    dateInput: 'D',
                },
                display: {
                    dateInput         : 'DDD',
                    monthYearLabel    : 'LLL yyyy',
                    dateA11yLabel     : 'DD',
                    monthYearA11yLabel: 'LLLL yyyy',
                },
            },
        }]
    ,
    imports: [CommonModule, RouterLink, ReactiveFormsModule, NgClass,
         MatButtonModule, MatIconModule, MatTooltipModule, MatRippleModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule, MatDividerModule,
         MatDatepickerModule, MatMomentDateModule, MatAutocompleteModule,
         DatePipe, AsyncPipe, MatExpansionModule, IdCardDetailsComponent],
    standalone: true
})
export class DirectorsDetailsComponent implements OnInit, OnDestroy {

    editMode: boolean = false;
    isNewDirector: boolean = false;
    dateFormat = 'MMM d, y';

    director: Director;
    directorForm: FormGroup;
    directors: Director[];
    countries: Country[];

    directorLanguages: DirectorLanguage[];
    directorLanguagesByCode: Record<string, DirectorLanguage>;
    directorClasses: DirectorClass[];
    directorClassesByCode: Record<string, DirectorClass>;
    directorTitles: DirectorTitle[];
    directorTypes: DirectorType[];
    directorStatus: DirectorStatus[];

    directorCommittees$: Observable<Committee[]>;
    directorProfileImage$: Observable<string>;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    horizontalPosition: MatSnackBarHorizontalPosition = 'right';
    verticalPosition: MatSnackBarVerticalPosition = 'top';
    cities: City[];
    idCardPanelState: boolean = true;
    organizations$: Observable<Organization[]>;
    committees$: Observable<Organization[]>;
    committeeOptionsPerAssignment: Committee[][] = [];

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _directorsListComponent: DirectorsListComponent,
        private _directorsService: DirectorsService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private dialog: MatDialog,
        private sanitizer: DomSanitizer,
        private _dialogConfigService: DialogConfigService,
        private _isoCountryService: ISOCountryService,
        private _snackBar: MatSnackBar,
        private _organizationsService: OrganizationsService,
        private _committeesService: CommitteesService,
    ) { }

    ngOnInit(): void {
        this.initComponentData();
        this.initForm();
        this.openDrawer();
        this.subscribeToRouterStateChanges();
        this.organizations$ = this._organizationsService.getOrganizations(of({page: 1, limit:100})).pipe(map(res => res.data))
    }

    subscribeToRouterStateChanges() {
     this._router.events
        .pipe(
            filter(event => event instanceof NavigationEnd),
            takeUntil(this._unsubscribeAll),
        )
        .subscribe(() => {
            const state = this._router.getCurrentNavigation()?.extras.state;
            if (state && state['editMode'] !== undefined) {
                this.editMode = state['editMode'];
            } else {
                this.editMode = this.isNewDirector;
            }
        });
    }

    private initComponentData(): void {
        this.initEditMode();
        this._activatedRoute.data.pipe(
            takeUntil(this._unsubscribeAll),
            tap(data => this.initFromRouteData(data)),
            tap(() => this._changeDetectorRef.markForCheck()),
        )
        .subscribe();
    }

    private initEditMode(): void {
        this.isNewDirector = this._activatedRoute.snapshot.params.id === 'new';
        this.editMode = this.isNewDirector;
    }

    private initFromRouteData(data: any): void {
        this.initCountries(data);
        this.initDirector(data);
        this.initDirectorClasses(data);
        this.initDirectorLanguages(data);
        this.initDirectorTitles(data);
        this.initDirectorTypes(data);
        this.initDirectorStatus(data);
        this.initDirectorCommittees();
        this.initDirectors(data);
        this.initCities();
    }

    private initCountries(data: any): void {
        this.countries = data.countries;
    }

    private initCities(): void {
    this._isoCountryService.getCities().pipe(takeUntil(this._unsubscribeAll)).subscribe((cities: City[]) => {
        this.cities = cities;
    })
    }
    private initDirector(data: any): void {
        this.director = data.director;
        this.directorProfileImage$ = this.director.picture
            ? this._directorsService.getProfileImage(this.director.picture)
            : EMPTY;
    }

    private initDirectorClasses(data: any): void {
        this.directorClasses = data.classes;
        this.directorClassesByCode = this.directorClasses
            .reduce((byCode, directorClass) => {
                byCode[directorClass.code] = directorClass;
                return byCode;
            }, { });
    }

    private initDirectorLanguages(data: any): void {
        this.directorLanguages = data.languages;
        this.directorLanguagesByCode = this.directorLanguages
            .reduce((byCode, language) => {
                byCode[language.code] = language;
                return byCode;
            }, { });
    }

    private initDirectorTitles(data: any): void {
        this.directorTitles = data.titles;
    }

    private initDirectorTypes(data: any): void {
        this.directorTypes = data.types;
    }

    private initDirectorStatus(data: RouteResolvedDirectorData): void {
        this.directorStatus = data.status;
    }

    private initDirectorCommittees(): void {
        this.directorCommittees$ =
            this._directorsService.getDirectorCommittees(this.director.code);
    }

    private initDirectors(data: any): void {
        this.directors = data.directors;
    }

    private initForm(): void {
        this.directorForm = this._formBuilder.group({
            _id: [''],
            code: [''],
            title: [''],
            shareholding_class: [''],
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            email: ['', [Validators.required, Validators.pattern(PATTERNS_CONSTANTS.EMAIL_PATTERN)]],
            telephone: [''],
            mobile: [''],
            fax: [''],
            faxPrefix: [''],
            phonePrefix: [''],
            mobilePrefix: [''],
            citizenship: [[], [Validators.required, maxSelectionValidator(3)]],
            position: [''],
            shipping_address: this._formBuilder.group({
                line1: [''],
                line2: [''],
                line3: [''],
                city: [''],
                locality: [''],
                state: [''],
                postcode: [''],
                country: [''],
            }),
            billing_address: this._formBuilder.group({
                line1: [''],
                line2: [''],
                line3: [''],
                city: [''],
                locality: [''],
                state: [''],
                postcode: [''],
                country: [''],
            }),
            assistant: this._formBuilder.group({
                firstname: [''],
                lastname: [''],
                email: [''],
                telephone: [''],
                mobile: [''],
                fax: [''],
                faxPrefix: ['+20'],
                phonePrefix: ['+20'],
                mobilePrefix: ['+20'],
            }),
            terms: this._formBuilder.array([]),
            ids: this._formBuilder.array([]),
            facebook: [''],
            twitter: [''],
            linkedin: [''],
            youtube: [''],
            picture: [''],
            language: ['', Validators.required],
            type: [''],
            linked_director: [''],
            institution: [''],
            hiring_date: [''],
            status: [''],
            email2: ['', Validators.pattern(PATTERNS_CONSTANTS.EMAIL_PATTERN)],
            bank_details: this._formBuilder.array([]),
            assignments: this._formBuilder.array([]),
        });
    }

    private initFormForUpdate(): void {
        const director = this.director;
        const controls = this.directorForm.controls;
        this.directorForm.patchValue(director);

        const [phonePrefix, phone] = this.getPrefixAndNumber(director?.telephone);
        controls.telephone.setValue(phone);
        controls.phonePrefix.setValue(phonePrefix);

        const [mobilePrefix, mobile] = this.getPrefixAndNumber(director?.mobile);
        controls.mobile.setValue(mobile);
        controls.mobilePrefix.setValue(mobilePrefix);

        const [faxPrefix, fax] = this.getPrefixAndNumber(director?.fax);
        controls.fax.setValue(fax);
        controls.faxPrefix.setValue(faxPrefix);

        const controlsAssistant = (this.directorForm.controls.assistant as FormGroup).controls;
        const assistant = director.assistant;

        const [phonePrefixAssistant, phoneAssistant] = this.getPrefixAndNumber(assistant?.telephone);
        controlsAssistant.telephone.setValue(phoneAssistant);
        controlsAssistant.phonePrefix.setValue(phonePrefixAssistant);

        const [mobilePrefixAssistant, mobileAssistant] = this.getPrefixAndNumber(assistant?.mobile);
        controlsAssistant.mobile.setValue(mobileAssistant);
        controlsAssistant.mobilePrefix.setValue(mobilePrefixAssistant);

        const [faxPrefixAssistant, faxAssistant] = this.getPrefixAndNumber(assistant?.fax);
        controlsAssistant.fax.setValue(faxAssistant);
        controlsAssistant.faxPrefix.setValue(faxPrefixAssistant);

        const idsArray = this.directorForm.get('ids') as FormArray;
        while (idsArray.length) {
        idsArray.removeAt(0);
        }
        for (const id of this.director.ids) {
        const idForm = this.createDocumentForm();
        idForm.patchValue(id);
        idsArray.push(idForm);
        }
        const termsArray = this.directorForm.get('terms') as FormArray;
        while (termsArray.length) {
        termsArray.removeAt(0);
        }
        for (const term of this.director.terms) {
        const termForm = this.createTermForm();
        termForm.patchValue(term);
        termsArray.push(termForm);
    }

        const bankDetailsArray = this.directorForm.get('bank_details') as FormArray;
        while (bankDetailsArray.length) {
        bankDetailsArray.removeAt(0);
    }
        for (const bankDetail of this.director.bank_details || []) {
        const bankDetailForm = this.createBankDetailsForm();
        bankDetailForm.patchValue(bankDetail);
        bankDetailsArray.push(bankDetailForm);
    }

    const assignmentsArray = this.directorForm.get('assignments') as FormArray;
    while (assignmentsArray.length) {
    assignmentsArray.removeAt(0);
    }

    for (const assignment of this.director.assignments || []) {
    assignmentsArray.push(this.createAssignmentForm(assignment));
    }

    this.director.assignments?.forEach((assignment, index) => {
    this.committeeOptionsPerAssignment.push([]);
    if (assignment.organizationCode) {
        this._committeesService.getCommitteesByOrgCode(assignment.organizationCode)
            .pipe(take(1))
            .subscribe(committees => {
                this.committeeOptionsPerAssignment[index] = committees;
                this._changeDetectorRef.markForCheck();
            });
        }
    });
    }

    private createAssignmentForm(init?: {
        organizationCode: string;
        committeeCodes: string[];
    }): FormGroup {
        return this._formBuilder.group({
            organizationCode: [
                init?.organizationCode || '',
                Validators.required,
            ],
            committeeCodes: [init?.committeeCodes || [], Validators.required],
        });
    }

    get assignments(): FormArray {
    return this.directorForm.get('assignments') as FormArray;
    }

    addAssignment(): void {
    this.assignments.push(this._formBuilder.group({
    organizationCode: [''],
    committeeCodes: [[]]
    }));
    this.committeeOptionsPerAssignment.push([]);
    }

    removeAssignment(index: number): void {
    this.assignments.removeAt(index);
    this.committeeOptionsPerAssignment.splice(index, 1);
    }

    private openDrawer(): void {
        this._directorsListComponent.matDrawer.open();
    }

    getDirectorsExcludingSelected(): Director[] {
        return this.directors.filter(director => director.code !== this.director.code);
    }

    getPrefixAndNumber(phone: string): Array<string> {
        if (!phone) {
            return ['+20', ''];
        }
        const country = this.findCountryByPhone(phone);

        return [country.code, phone.substr(country.code.length, phone.length)];
    }

    findCountryByPhone(phone: string): Country {
        if (!phone) {
            return this.countries.find(country => country.iso === 'eg');
        }
        const found = this.countries.find(country => phone.includes(country.code));
        return !!found
            ? found
            : this.countries.find(country => country.iso === 'eg');
    }

    ngOnDestroy(): void {
        // this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._directorsListComponent.matDrawer.close();
    }

    toggleEditMode(): void {
        this.editMode = !this.editMode;
        !this.isNewDirector && this.initFormForUpdate();
    }

    alterShippingAddress(): void {
        const formControl = this.directorForm.controls.shipping_address;
        this.alterAddress(formControl, result => this.director.shipping_address = result);
    }

    alterBillingAddress(): void {
        const formControl = this.directorForm.controls.billing_address;
        this.alterAddress(formControl, result => this.director.billing_address = result);
    }

    private async alterAddress(formControl: AbstractControl, onResult: (result: any) => void): Promise<void> {
        const data = { form: formControl, countries: this.countries, cities: this.cities };
        const dialogConfig = await this._dialogConfigService.getDialogConfig(data);
        this.dialog
            .open(AddDirectorsAddressDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                tap(result => formControl.patchValue(result)),
                tap(result => onResult(result)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
    }

    async alterAssistant(): Promise<void> {
        const data = { form: this.directorForm.controls.assistant, countries: this.countries };
        const dialogConfig = await this._dialogConfigService.getDialogConfig(data);
        this.dialog
            .open(AddDirectorsAssistantDialogComponent, dialogConfig)
            .afterClosed()
            .subscribe((assistant: any) => {
                if (!assistant) {
                    return;
                }
                const newAssistant = { ...assistant };

                newAssistant.telephone = `${newAssistant.phonePrefix}${newAssistant.telephone}`;
                newAssistant.mobile = `${newAssistant.mobilePrefix}${newAssistant.mobile}`;
                newAssistant.fax = `${newAssistant.faxPrefix}${newAssistant.fax}`;
                delete newAssistant.phonePrefix;
                delete newAssistant.mobilePrefix;
                delete newAssistant.faxPrefix;
                this.directorForm.controls.assistant.patchValue(assistant);
                this.director.assistant = newAssistant;
                this._changeDetectorRef.markForCheck();
            });
    }

    updateDirector(): void {
        const director = { ...this.directorForm.getRawValue() };
        const newDirector = this.prepareToServiceCall(director);
        if (this.isNewDirector) {
            // @ts-ignore
            this.createDirector(newDirector);
        } else {
            this._directorsService.updateDirector(director.code, newDirector)
                .pipe(
                    take(1),
                    tap(() => this.finaliseUpdate()),
                )
                .subscribe();
        }
    }

    private finaliseUpdate(): void {
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        this.closeDrawer();
        this._changeDetectorRef.markForCheck();
    }

    prepareToServiceCall(director2): any {
        const director = { ...director2 };
        director.telephone = director.phonePrefix + director.telephone;
        director.mobile = director.mobilePrefix + director.mobile;
        if (director.fax) {
            director.fax = director.faxPrefix + director.fax;
        }

        delete director.ids;
        delete director.bank_details;
        delete director._id;
        delete director.code;

        delete director.picture;
        delete director.terms;


        delete director.phonePrefix;
        delete director.mobilePrefix;
        delete director.faxPrefix;

        const { assistant } = director;

        if (assistant) {
            assistant.telephone = assistant.phonePrefix + assistant.telephone;
            assistant.mobile = assistant.mobilePrefix + assistant.mobile;
            if (assistant.fax) {
                assistant.fax = assistant.faxPrefix + assistant.fax;
            }

            delete assistant.phonePrefix;
            delete assistant.mobilePrefix;
            delete assistant.faxPrefix;

        }

        return director;
    }

    createDirector(director: Director): void {
        this._directorsService.createDirector(director)
            .pipe(
                take(1),
                tap(dir => this.finaliseCreate(dir)),
            )
            .subscribe();
    }

    private finaliseCreate(director: Director): void {
        this._router.navigate(['../'], {
            queryParams: { select: director.code },
            relativeTo: this._activatedRoute,
        });
        this._changeDetectorRef.markForCheck();
    }

    async deleteDirector(): Promise<void> {

      const code = this.director.code;

      const currentDirectorIndex = this.directors.findIndex(item => item.code === code);
      const nextDirectorIndex = currentDirectorIndex + ((currentDirectorIndex === (this.directors.length - 1)) ? -1 : 1);
      const nextDirector = (this.directors.length === 1 && this.directors[0].code === code) ? null : this.directors[nextDirectorIndex];

      const dialogConfig = await this._dialogConfigService.getDialogConfig(EntityTypeEnum.DIRECTOR);

      this.dialog
          .open(ConfirmDeleteDialogComponent, dialogConfig)
          .afterClosed()
          .pipe(
              take(1),
              filter(Boolean),
              switchMap((reason) =>
                  this._directorsService.deleteDirector(code, reason)
              )
          )
          .subscribe((director) => {
              if (!director) {
                  return;
              }
              
              this._router.navigate(['../'], { relativeTo: this._activatedRoute });
              this.toggleEditMode();
          });

      this._changeDetectorRef.markForCheck();
    }


    addDocumentField(): void {
        const form = this.createDocumentForm();
        this.openDirectorDocumentCreateDialog(form);
    }

    private createDocumentForm(init?: IdCard): FormGroup {
        return this._formBuilder.group({
            type: [init?.type || '', Validators.required],
            firstname: [init?.firstname || '', Validators.required],
            lastname: [init?.lastname || '', Validators.required],
            nationality: [init?.nationality || '', Validators.required],
            dob: [init?.dob || '', Validators.required],
            doi: [init?.doi || '', Validators.required],
            exp: [init?.exp || '', Validators.required],
            num: [init?.num || '', Validators.required],
            coi: [init?.coi || '', Validators.required],
            authority: [init?.authority || '', Validators.required],
            code: [init?.code || ''],
        });
    }

    private async openDirectorDocumentCreateDialog(form: FormGroup): Promise<void> {
        const data = { form, countries: this.countries };
        const dialogConfig = await this._dialogConfigService.getDialogConfig(data);
        this.dialog.open(AddDirectorsDocumentDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(result => this.createDirectorIdCard(result as IdCard)),
                tap(idCard => form.get('code').setValue(idCard.code)),
                tap(() => (this.directorForm.get('ids') as FormArray).push(form)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
        this._changeDetectorRef.markForCheck();
    }

    private createDirectorIdCard(idCard: IdCard): Observable<IdCard> {
        return this._directorsService.createDirectorIdCard(this.director.code, idCard);
    }

    editDocumentField(index: number): void {
        const formArray = this.directorForm.get('ids') as FormArray;
        const idCard = formArray.value[index] as IdCard;
        const form = this.createDocumentForm(idCard);
        this.openDirectorDocumentEditDialog(form, index);
    }

    private async openDirectorDocumentEditDialog(form: FormGroup, index?: number): Promise<void> {
        const data = { form, countries: this.countries };
        const directorCode = this.director.code;
        const idCardCode = form.get('code').value;
        const dialogConfig = await this._dialogConfigService.getDialogConfig(data);
        this.dialog.open(AddDirectorsDocumentDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(result => this._directorsService
                    .updateDirectorIdCard(directorCode, idCardCode, result as IdCard)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe((res) => {
                (<FormArray>this.directorForm.get('ids')).at(index).patchValue(res);
            });
        this._changeDetectorRef.markForCheck();
    }

    removeDocumentField(index: number): void {
        const formArray = this.directorForm.get('ids') as FormArray;
        const idCard = formArray.value[index] as IdCard;
        this._directorsService.deleteDirectorIdCard(this.director.code, idCard.code)
            .pipe(
                take(1),
                tap(() => formArray.removeAt(index)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
    }

    viewDocumentField(idCard: IdCard): void {
        const form = this.createDocumentForm(idCard);
        form.disable();
        this.openDirectorDocumentEditDialog(form);
    }

    getDocumentDocument(idCard: IdCard): void {
        this._directorsService.downloadDirectorIdCardDocumentUrls(idCard)
            .pipe(
                take(1),
                tap(urls => urls.forEach(url => window.open(url, '_blank'))),
            )
            .subscribe();
    }

    addDocumentDocumentField(idIndex: number): void {
        this.openDirectorDocumentDocumentDialog(idIndex);
    }

    private async openDirectorDocumentDocumentDialog(idIndex: number): Promise<void> {
        const idsArray = this.directorForm.get('ids') as FormArray;
        const idCard = idsArray.value[idIndex] as IdCard;
        const currentIdCard = this.director?.ids?.find(c => c?.code === idCard?.code);
        
        const dialogConfig = await this._dialogConfigService.getDialogConfig({idCard: idCard, director: this.director, documents: currentIdCard?.documents});
        this.dialog.open(AddDirectorsDocumentDocumentDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(result =>
                    this.createDirectorIdCardDocuments(idCard.code, result as FileList)),
                tap(documentCodes => idCard.documents.concat(documentCodes)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
        this._changeDetectorRef.markForCheck();
    }

    private createDirectorIdCardDocuments(
        idCardCode: string,
        files: FileList
    ): Observable<{ code: string }[]> {
/*         const documentCodes = [];
        const dirCode = this.director.code;
        return this._directorsService.uploadDirectorIdCardDocuments(files)
            .pipe(
                tap(documentCode => documentCodes.push({ code: documentCode })),
                mergeMap(documentCode => this._directorsService
                    .createDirectorIdCardDocument(dirCode, idCardCode, documentCode)),
                takeLast(1),
                map(() => documentCodes),
            ); */
            return EMPTY
    }

    getCountryByIso(iso: string | string[]): Country {
       return this._isoCountryService.getCountryByIso(iso);
    }


    getCountryByName(name: string): Country {
        return this.countries.find((country) => country.name === name);
    }

    getCountryByCode(code: string): Country {
        if (!code) {
            return this.countries.find((country) => country.iso === 'eg');
        } else {
            return this.countries.find((country) => country.code === code);
        }
    }

    trackByFn(index: number, item: any): any {
        return item?.code || index;
    }

    addTermField(): void {
        const form = this.createTermForm();
        this.openDirectorTermDialog(form);
    }

    private createTermForm(): FormGroup {
        return this._formBuilder.group({
            code: [''],
            from: ['', Validators.required],
            to: ['', Validators.required],
        });
    }

    private async openDirectorTermDialog(form: FormGroup): Promise<void> {
        const dialogConfig = await this._dialogConfigService.getDialogConfig(form);
        this.dialog.open(AddDirectorsTermDialogComponent, dialogConfig)
            .afterClosed()
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(term => {
                    // Validate if the term clashes with existing terms
                    if (this.isTermClashing(term as DirectorTerm)) {
                        this._snackBar.open('The new director term clashes with existing terms and will not be saved.', 'Dismiss', {
                            horizontalPosition: this.horizontalPosition,
                            verticalPosition: this.verticalPosition,
                            duration: 5000
                        });
                        return EMPTY; // Stop the stream
                    }
                    return this.createDirectorTerm(term as DirectorTerm);
                }),
                tap(term => form.get('code').setValue(term.code)),
                tap(() => (this.directorForm.get('terms') as FormArray).push(form)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Checks if a new director's term clashes with any existing terms.
     *
     * @param newTerm - The new term to be added.
     * @returns True if the new term clashes with an existing term, otherwise false.
     */
    private isTermClashing(newTerm: DirectorTerm): boolean {
        const newTermFrom = new Date(newTerm.from);
        const newTermTo = new Date(newTerm.to);
        const terms = (this.directorForm.get('terms') as FormArray).value;

        return terms.some(term => {
            const oldTermFrom = new Date(term.from);
            const oldTermTo = new Date(term.to);
            return this.isIntervalClashing(oldTermFrom, oldTermTo, newTermFrom, newTermTo);
            });
        }

    /**
    * Checks if two date intervals overlap.
    *
    * @param oldTermFrom - The start date of the existing term.
    * @param oldTermTo - The end date of the existing term.
    * @param newTermFrom - The start date of the new term.
    * @param newTermTo - The end date of the new term.
    * @returns True if the intervals overlap, otherwise false.
    */
    private isIntervalClashing(oldTermFrom: Date, oldTermTo: Date, newTermFrom: Date, newTermTo: Date): boolean {
      // Check if the intervals [oldTermFrom, oldTermTo] and [newTermFrom, newTermTo] overlap
       return oldTermFrom <= newTermTo && newTermFrom <= oldTermTo;
    }

    /**
     * Gets categorized director terms.
     *
     * This function categorizes the director's terms into the current term and previous terms
     * based on the current date. It iterates over the director's terms and assigns the term
     * to the current term if it is active or to the previous terms if it has ended.
     *
     * @returns {object} An object containing the current term and an array of previous terms.
     */
    getCategorizedTerms(): { currentTerm: DirectorTerm | null, previousTerms: DirectorTerm[] } {
      const currentDate = new Date();
      let currentTerm: DirectorTerm | null = null;
      const previousTerms: DirectorTerm[] = [];

      this.director.terms.forEach(term => {
        if (new Date(term.to) >= currentDate) {
            currentTerm = term;
        } else {
            previousTerms.push(term);
        }
        });

      return { currentTerm, previousTerms };
    }


    private createDirectorTerm(term: DirectorTerm): Observable<DirectorTerm> {
        return this._directorsService.createDirectorTerm(this.director.code, term);
    }

    removeTermField(index: number): void {
        const termsArray = this.directorForm.get('terms') as FormArray;
        const term = termsArray.value[index] as DirectorTerm;
        this._directorsService.deleteDirectorTerm(this.director.code, term.code)
            .pipe(
                tap(() => termsArray.removeAt(index)),
                tap(() => this._changeDetectorRef.markForCheck()),
            )
            .subscribe();
    }

    getDirectorClassForChip(classCode: string): string {
        const label = this.directorClassesByCode[classCode].label;
        return label.length === 1
            ? `Class ${label}`
            : label;
    }

    fileUrl(input: HTMLInputElement): SafeUrl {
        const url = URL.createObjectURL(input.files[0]);
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    onProfileImageChange(event: Event): void {
        const isEventDefined = event && event.target;
        const fileInput = event.target as HTMLInputElement;
        const isFileSelected = fileInput.files && fileInput.files.length;
        if (isEventDefined && isFileSelected) {
            this.uploadProfileImage(fileInput.files[0]);
        }
    }

    private uploadProfileImage(file: File): void {
        this._directorsService.uploadProfileImage(file)
            .pipe(
                take(1),
                tap(imageCode => {
                    const field = this.directorForm.get('picture');
                    field.setValue(imageCode);
                    field.markAsTouched();
                }),
                switchMap(imageCode => this._directorsService
                    .updateProfileImage(this.director.code, imageCode)),
            )
            .subscribe();
    }

    sortedDirectorTerms(): DirectorTerm[] {
        return this._directorsService.sortedDirectorTerms(this.director.terms);
    }

   /**
   * Creates a FormGroup for bank details with optional initial values.
   * @param accountDetail Optional initial values for the form.
   * @returns A FormGroup with controls for IBAN, account number, BIC, bank name, bank address, and code.
    */
    private createBankDetailsForm(accountDetail?: AccountDetail): FormGroup {
    return this._formBuilder.group({
        iban: [accountDetail?.iban || ''],
        account_no: [accountDetail?.account_no || ''],
        bic: [accountDetail?.bic || ''],
        bank_name: [accountDetail?.bank_name || '', Validators.required],
        bank_address: [accountDetail?.bank_address || ''],
        code: [accountDetail?.code || ''],
    },
    { validator: atLeastOneRequired('iban', 'account_no') });
    }

  /**
    * Calls the service to create director bank details.
    * @param accountDetail The bank details to be created.
    * @returns An Observable of the created AccountDetail.
   */
   private createDirectorBankDetails(accountDetail: AccountDetail): Observable<AccountDetail> {
    return this._directorsService.createDirectorBankDetails(this.director.code, accountDetail);
    }

  /**
    * Adds a new bank details field to the form.
    * Creates a new bank details form and opens the creation dialog.
   */
    addBankDetailsField(): void {
    const form = this.createBankDetailsForm();
    this.openDirectorBankDetailsCreateDialog(form);
    }

   /**
    * Opens the dialog to create director bank details.
    * @param form The FormGroup representing the bank details form.
   */
    private async openDirectorBankDetailsCreateDialog(form: FormGroup): Promise<void> {
    const data = { form };
    const dialogConfig = await this._dialogConfigService.getDialogConfig(data);
    this.dialog.open(AddBankDetailsDialogComponent, dialogConfig)
        .afterClosed()
        .pipe(
            take(1),
            filter(Boolean),
            switchMap(result => this.createDirectorBankDetails(result as AccountDetail)),
            tap(accountDetail => form.get('code').setValue(accountDetail.code)),
            tap(() => (this.directorForm.get('bank_details') as FormArray).push(form)),
            tap(() => this._changeDetectorRef.markForCheck()),
        )
        .subscribe();
    this._changeDetectorRef.markForCheck();
    }

    /**
     * Edits an existing bank details field.
     * @param index The index of the bank details field to edit.
    */
    editBankDetailsField(index: number): void {
    const formArray = this.directorForm.get('bank_details') as FormArray;
    const accountDetail = formArray.value[index] as AccountDetail;
    const form = this.createBankDetailsForm(accountDetail);
    this.openDirectorBankDetailsEditDialog(form, index);
    }

    /**
     * Opens the dialog to edit director bank details.
     * @param form The FormGroup representing the bank details form.
    */
    private async openDirectorBankDetailsEditDialog(form: FormGroup, index: number): Promise<void> {
    const data = { form };
    const directorCode = this.director?.code;
    const accountDetailCode = form.get('code').value;
    const dialogConfig = await this._dialogConfigService.getDialogConfig(data);
    this.dialog.open(AddBankDetailsDialogComponent, dialogConfig)
        .afterClosed()
        .pipe(
            take(1),
            filter(Boolean),
            switchMap(result => this._directorsService
                .updateDirectorBankDetails(directorCode, accountDetailCode, result as AccountDetail)),
            tap(() => this._changeDetectorRef.markForCheck()),
        )
        .subscribe((res) => {
            (<FormArray>this.directorForm.get('bank_details')).at(index).patchValue(res);
        });
    this._changeDetectorRef.markForCheck();
    }

    /**
     * Removes an existing bank details field.
     * @param index The index of the bank details field to remove.
    */
    removeBankDetailsField(index: number): void {
    const formArray = this.directorForm.get('bank_details') as FormArray;
    const accountDetail = formArray.value[index] as AccountDetail;
    this._directorsService.deleteDirectorBankDetails(this.director.code, accountDetail.code)
        .pipe(
            take(1),
            tap(() => formArray.removeAt(index)),
            tap(() => this._changeDetectorRef.markForCheck()),
        )
        .subscribe();
    }

    /**
    * Retrieves the names of the countries associated with the director's citizenships.
    * If the director has citizenships, it maps each ISO code to the corresponding country name.
    * Returns a comma-separated string of the country names.
    * If the director has no citizenships or if the citizenships array is empty, returns an empty string.
    *
    * @returns {string} - Comma-separated string of country names or an empty string if no citizenships are present.
    */
    getCitizenshipNames(): string {
        const citizenship = this.director?.citizenship;
        if (Array.isArray(citizenship) && citizenship.length > 0) {
          return citizenship.map(iso => this.getCountryByIso(iso)?.name).join(', ');
        }
        return '';
      }

    /**
     * Checks if the maximum number of selections has been reached in the 'citizenship' form control.
     *
     * @returns {boolean} - True if the number of selected items is greater than or equal to 3, otherwise false.
     */
    isMaxSelected(): boolean {
        return this.directorForm.get('citizenship').value.length >= 3;
    }

    /**
     * Checks if a specific value is included in the selected values of the 'citizenship' form control.
     *
     * @param {string} value - The value to check for selection.
     * @returns {boolean} - True if the value is selected, otherwise false.
     */
    isSelected(value: string): boolean {
        return this.directorForm.get('citizenship').value.includes(value);
    }

    unArchiveDirector() {
        this._directorsService.unArchiveDirector(this.director?.code).
        pipe(take(1), tap(() => this.finaliseUpdate())).subscribe();
    }

    onOrgChange(index: number): void {
    const orgCode = this.assignments.at(index).get('organizationCode').value;
    if (orgCode) {
        this._committeesService.getCommitteesByOrgCode(orgCode)
            .pipe(take(1))
            .subscribe(committees => {
                this.committeeOptionsPerAssignment[index] = committees;

                this.assignments.at(index).get('committeeCodes').reset([]);
                this._changeDetectorRef.markForCheck();
            });
            }
    }
}
