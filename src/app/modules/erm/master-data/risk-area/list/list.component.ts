import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RiskArea, RiskAreaPagination } from '../../../models/risk-area.model';
import { ErmService } from '../../../../../shared/services/erm.service';
import { RiskAreaService } from '../risk-area.service';

// ✅ Fuse replacement
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector       : 'app-risk-area-list',
  templateUrl    : './list.component.html',
  styleUrls      : ['./list.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations     : fuseAnimations,
  providers      : [ErmService]
})
export class RiskAreaListComponent implements OnInit {

  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  columns: string[] = ['code', 'name', 'description', 'details'];
  selectedRiskAreaForm: FormGroup;
  pagination: RiskAreaPagination;
  riskAreas$: Observable<RiskArea[]>;
  selectedRiskArea: RiskArea | null = null;
  isLoading = true;
  riskAreasCount = 0;
  searchInputControl: FormControl = new FormControl();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      private _fb: FormBuilder,
      private _riskAreaService: RiskAreaService,
  ) {}

  ngOnInit(): void {
    this.selectedRiskAreaForm = this._fb.group({
      id         : [''],
      code       : [''],
      name       : ['', [Validators.required]],
      description: [''],
      status     : [''],
    });

    this._riskAreaService.pagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: RiskAreaPagination) => {
          this.pagination = pagination;
          this._changeDetectorRef.markForCheck();
        });

    this.riskAreas$ = this._riskAreaService.riskAreas$;
    this._riskAreaService.riskAreas$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((riskAreas: RiskArea[]) => {
          this.riskAreasCount = riskAreas.length;
          this._changeDetectorRef.markForCheck();
          this.isLoading = false;
        });
  }

  createThreshold(): void {
    // TODO: implement create dialog
  }

  toggleDetails(id: string): void {
    if (this.selectedRiskArea && this.selectedRiskArea.id === id) {
      this.closeDetails();
      return;
    }

    this._riskAreaService.getRiskAreaById(id).subscribe((riskArea) => {
      this.selectedRiskArea = riskArea;
      this.selectedRiskAreaForm.patchValue(riskArea);
      this._changeDetectorRef.markForCheck();
    });
  }

  closeDetails(): void {
    this.selectedRiskArea = null;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
