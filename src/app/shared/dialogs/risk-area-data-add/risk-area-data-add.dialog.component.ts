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
import { RiskArea } from '../../../modules/erm/models/risk-area.model';
import { RiskAreaData } from '../../../modules/erm/models/risk-area-data.model';
import { RiskAreaService } from '../../../modules/erm/master-data/risk-area/risk-area.service';

@Component({
    selector: 'app-risk-area-data-add.dialog',
    templateUrl: './risk-area-data-add.dialog.html',
    styleUrls: ['./risk-area-data-add.dialog.css'],
})
export class RiskAreaDataAddDialogComponent implements OnInit {
    countryAutoSuggestions: Observable<any[]>;
    riskAreas: RiskArea[];
    form: FormGroup;
    current: RiskAreaData;
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
        public dialogRef: MatDialogRef<RiskAreaDataAddDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: RiskAreaData,
        private fb: FormBuilder,
        private _riskAreaService: RiskAreaService,
        private _changeDetectorRef: ChangeDetectorRef,
        public toastr: ToastrService
    ) {
        this.current = {} as RiskAreaData;
        this.form = this.fb.group({
            riskAreaId: ['', [Validators.required]],
            month: ['', [Validators.required]],
            year: ['', [Validators.required]],
            weight: ['', [Validators.required]],
            quantitativeWeight: ['', [Validators.required]],
            qualitativeWeight: ['', [Validators.required]],
            qualitativeScore: ['', [Validators.required]],
            description: ['', []],
        });
    }
    save(): void {
        const data = this.form.getRawValue();
        this.dialogRef.close(data);
    }
    ngOnInit(): void {
        this.form.patchValue(this.data);
        this._riskAreaService.getRiskAreas().subscribe((res: any) => {
            this.riskAreas = res.data;
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
