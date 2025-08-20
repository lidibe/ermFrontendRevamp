import {ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {KriData} from '../../../modules/erm/models/kri-data.model';
import {Kri} from '../../../modules/erm/master-data/kri/kri.types';
import {KriService} from '../../../modules/erm/master-data/kri/kri.service';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-kri-data-add.dialog',
    templateUrl: './kri-data-add.dialog.html',
    styleUrls: ['./kri-data-add.dialog.css'],
})
export class KriDataAddDialogComponent implements OnInit {

    countryAutoSuggestions: Observable<any[]>;
    kris: Kri[];
    form: FormGroup;
    current: KriData;
    kris$: Observable<Kri[]>;
    krisCount: number = 0;
    id: string;
    selectedKri: Kri;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    statuses = [
        {label: 'ACTIVE', value: 'ACTIVE'},
        {label: 'OVERRIDE', value: 'OVERRIDE'},
        {label: 'POTENTIAL DUPLICATE', value: 'POTENTIAL DUPLICATE'},
        {label: 'DUPLICATE', value: 'DUPLICATE'},
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
            [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
            ['clean']
        ]
    };
    @ViewChild('input', {static: true}) input: ElementRef;

    constructor(public dialogRef: MatDialogRef<KriDataAddDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private router: Router,
                private fb: FormBuilder,
                private _kriService: KriService,
                private _changeDetectorRef: ChangeDetectorRef,
                public toastr: ToastrService) {
        this.current = {} as KriData;
        this.form = this.fb.group({
            kriId: ['', [Validators.required]],
            month: ['', []],
            year: ['', []],
            value: ['', []],
            comments: ['', []],
        });
    }
    save(): void {
        const data = this.form.getRawValue();
        // console.log('data', data);
        this.dialogRef.close(data);
    }
    ngOnInit(): void {
        this.form.patchValue(this.data);
        if (this.data && this.data.origin === 'home') {
            this.loadMyKris();
        } else {
            this.loadAllKris();
        }
    }
    loadMyKris(): void {
        this._kriService.getMyGroupKris().subscribe((res: any) => {
            this.kris = res.data;
            this._changeDetectorRef.detectChanges();
        });
    }
    loadAllKris(): void {
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
