import {
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
import { RiskArea } from '../../../modules/erm/models/risk-area.model';

@Component({
    selector: 'app-kri-risk-types.dialog',
    templateUrl: './kri-risk-types.dialog.html',
    styleUrls: ['./kri-risk-types.dialog.css'],
})
export class KriRiskTypesDialogComponent implements OnInit {
    title = 'Add KRI Risk Types';
    countryAutoSuggestions: Observable<any[]>;
    kris: Kri[];
    riskAreas: RiskArea[];
    form: FormGroup;
    current: KriData;
    id: string;
    quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
        ],
    };
    @ViewChild('input', { static: true }) input: ElementRef;

    constructor(
        public dialogRef: MatDialogRef<KriRiskTypesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: KriData,
        private fb: FormBuilder,
        public toastr: ToastrService
    ) {
        this.current = {} as KriData;
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            description: ['', []],
        });
    }
    save(): void {
        const data = this.form.getRawValue();
        this.dialogRef.close(data);
    }
    ngOnInit(): void {
        this.form.patchValue(this.data);
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
