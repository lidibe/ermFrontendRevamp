import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KriData } from '../../../modules/erm/models/kri-data.model';
import { Kri } from '../../../modules/erm/master-data/kri/kri.types';
import { KriService } from '../../../modules/erm/master-data/kri/kri.service';
import { RiskArea } from '../../../modules/erm/models/risk-area.model';

@Component({
    selector: 'app-kri-threshold.dialog',
    templateUrl: './kri-threshold.dialog.html',
    styleUrls: ['./kri-threshold.dialog.css'],
})
export class KriThresholdDialogComponent implements OnInit {
    title = 'Add KRI Threshold';
    countryAutoSuggestions: Observable<any[]>;
    kris: Kri[];
    riskAreas: RiskArea[];
    form: FormGroup;
    current: KriData;
    id: string;
    statuses = [
        { label: 'ACTIVE', value: 'ACTIVE' },
        { label: 'OVERRIDE', value: 'OVERRIDE' },
        { label: 'POTENTIAL DUPLICATE', value: 'POTENTIAL DUPLICATE' },
        { label: 'DUPLICATE', value: 'DUPLICATE' },
    ];
    years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
    months = [
        { id: '1', value: 'January' },
        { id: '2', value: 'February' },
        { id: '3', value: 'March' },
        { id: '4', value: 'April' },
        { id: '5', value: 'May' },
        { id: '6', value: 'June' },
        { id: '7', value: 'July' },
        { id: '8', value: 'August' },
        { id: '9', value: 'September' },
        { id: '10', value: 'October' },
        { id: '11', value: 'November' },
        { id: '12', value: 'December' },
    ];
    quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
        ],
    };
    @ViewChild('input', { static: true }) input: ElementRef;

    constructor(
        public dialogRef: MatDialogRef<KriThresholdDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: KriData,
        private fb: FormBuilder,
        private _kriService: KriService,
        private _changeDetectorRef: ChangeDetectorRef,
        public toastr: ToastrService
    ) {
        this.current = {} as KriData;
        this.form = this.fb.group({
            kri_id: ['', [Validators.required]],
            month: ['', [Validators.required]],
            year: ['', [Validators.required]],
            bau: ['', [Validators.required]],
            trigger: ['', [Validators.required]],
            rlimit: ['', [Validators.required]],
            description: ['', []],
        });
    }
    save(): void {
        const data = this.form.getRawValue();
        this.dialogRef.close(data);
    }
    ngOnInit(): void {
        this.form.patchValue(this.data);
        this._kriService.getKris().subscribe((res: any) => {
            this.kris = res.data;
            this._changeDetectorRef.detectChanges();
        });
    }
    closeDialog(): void {
        this.dialogRef.close();
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    cancel(): void {
        this.dialogRef.close();
    }
}
