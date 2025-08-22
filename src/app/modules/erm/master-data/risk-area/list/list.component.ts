import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Observable, Subject} from 'rxjs';
import {RiskArea, RiskAreaPagination} from '../../../models/risk-area.model';
import {ErmService} from '../../../../../shared/services/erm.service';
import {RiskAreaService} from '../risk-area.service';
import {takeUntil} from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-risk-area-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations     : fuseAnimations,
  providers: [ErmService]
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
  riskAreasCount: number = 0;
  searchInputControl: FormControl = new FormControl();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      private _fb: FormBuilder,
      private _riskAreaService: RiskAreaService,
  ) { }

  ngOnInit(): void {

    this.selectedRiskAreaForm = this._fb.group({
      id               : [''],
      code             : [''],
      name             : ['', [Validators.required]],
      description      : [''],
      status           : [''],
    });

    // Get the pagination
    this._riskAreaService.pagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: RiskAreaPagination) => {

          // Update the pagination
          this.pagination = pagination;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        });

    // Get the risk areas
    this.riskAreas$ = this._riskAreaService.riskAreas$;
    this._riskAreaService.riskAreas$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((riskAreas: RiskArea[]) => {
          // console.log('---riskAreas ---', riskAreas);

          // Update the counts
          this.riskAreasCount = riskAreas.length;

          // Mark for check
          this._changeDetectorRef.markForCheck();
          this.isLoading = false;
        });
  }

  createThreshold(): void {
  }

  toggleDetails(id: string): void
  {
    // If the product is already selected...
    // console.log('this.selectedRiskArea', this.selectedRiskArea, id);
    if ( this.selectedRiskArea && this.selectedRiskArea.id === id )
    {
      // Close the details
      this.closeDetails();
      return;
    }

    // Get the product by id
    this._riskAreaService.getRiskAreaById(id)
        .subscribe((riskArea) => {

          // console.log('riskArea', riskArea, id);

          // Set the selected product
          this.selectedRiskArea = riskArea;

          // Fill the form
          this.selectedRiskAreaForm.patchValue(riskArea);

          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
  }

  /**
   * Close the details
   */
  closeDetails(): void
  {
    this.selectedRiskArea = null;
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

}
