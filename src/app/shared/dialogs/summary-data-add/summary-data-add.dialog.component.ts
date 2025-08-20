import {ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {SummaryData} from '../../../modules/erm/risk-data/summary-data/summary-data.types';
import {SummaryDataService} from '../../../modules/erm/risk-data/summary-data/summary-data.service';
import {RiskAreaService} from '../../../modules/erm/master-data/risk-area/risk-area.service';

@Component({
    selector: 'app-summary-data-add.dialog',
    templateUrl: './summary-data-add.dialog.html',
    styleUrls: ['./summary-data-add.dialog.css'],
})
export class SummaryDataAddDialogComponent implements OnInit {

    countryAutoSuggestions: Observable<any[]>;
    kris: SummaryData[];
    form: FormGroup;
    current: SummaryData;
    kris$: Observable<SummaryData[]>;
    krisCount: number = 0;
    id: string;
    selectedSummaryData: SummaryData;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
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
            [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
            ['clean']
        ]
    };
    @ViewChild('input', {static: true}) input: ElementRef;
    riskAreas: any;

    constructor(public dialogRef: MatDialogRef<SummaryDataAddDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: SummaryData,
                private router: Router,
                private fb: FormBuilder,
                private _summaryDataService: SummaryDataService,
                private _riskAreaService: RiskAreaService,
                private _changeDetectorRef: ChangeDetectorRef,
                public toastr: ToastrService) {
        this.current = {} as SummaryData;
        this.form = this.fb.group({
            month: ['', []],
            year: ['', []],
            comments: ['', []],
        });
    }
    save(): void {
        const data = this.form.getRawValue();
        this.dialogRef.close(data);
    }
    ngOnInit(): void {
        this.form.patchValue(this.data);
        this.getRiskAreas();
        this._summaryDataService.getSummaryDatas().subscribe((res: any) => {
            this.kris = res.data;
            this._changeDetectorRef.detectChanges();
        });

    }
    getRiskAreas(): void {
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
