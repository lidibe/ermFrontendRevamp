import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Observable, Subject, merge} from 'rxjs';
import {RiskArea, RiskAreaPagination} from '../../../models/risk-area.model';
import {ErmService} from '../../../../../shared/services/erm.service';
import {RiskAreaService} from '../risk-area.service';
import {debounceTime, map, switchMap, takeUntil} from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { KriRiskTypesDialogComponent } from 'app/shared/dialogs/kri-risk-types/kri-risk-types.dialog.component';

@Component({
  selector: 'app-risk-area-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations     : fuseAnimations,
  providers: [ErmService]
})
export class RiskAreaListComponent implements OnInit, AfterViewInit, OnDestroy {

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
  isPerforming = false;
  flashMessage: 'success' | 'error' | null = null;
  showAlert = false;

  query = {
    sort: 'created_at' as string,
    order: 'asc' as 'asc' | 'desc' | '',
    page: 1,
    size: 10,
    id: '',
    name: undefined as string | undefined,
    code: undefined as string | undefined,
  };

  constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      private _fb: FormBuilder,
      private _riskAreaService: RiskAreaService,
      private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.selectedRiskAreaForm = this._fb.group({
      id: [''],
      code: [''],
      name: ['', [Validators.required]],
      description: [''],
      status: [''],
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
          this.riskAreasCount = riskAreas?.length ?? 0;
          this._changeDetectorRef.markForCheck();
          this.isLoading = false;
        });

    this._riskAreaService.getRiskAreas(this.query).subscribe();
  }

  createThreshold(): void {}

  toggleDetails(id: string): void {
    if ( this.selectedRiskArea && this.selectedRiskArea.id === id ) {
      this.closeDetails();
      return;
    }
    this._riskAreaService.getRiskAreaById(id)
        .subscribe((riskArea) => {
          this.selectedRiskArea = riskArea;
          this.selectedRiskAreaForm.patchValue(riskArea);
          this._changeDetectorRef.markForCheck();
        });
  }

  updateSelectedRiskType(): void {
    this.isPerforming = true;
    const riskType = this.selectedRiskAreaForm.getRawValue();
    this._riskAreaService.updateRiskType(riskType.id, riskType)
        .subscribe(() => {
                this.isPerforming = false;
                this.showFlashMessage('success');
            },
            ((error: HttpErrorResponse) => {
                this.isPerforming = false;
                this.showFlashMessage('error');
                console.log(error.error);
            })
        );
  }

  createRiskType(): void {
    const dialogRef = this.dialog.open(KriRiskTypesDialogComponent, {});
    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            this._riskAreaService.createRiskType(result)
                .subscribe(
                    (riskArea) => {
                        if (riskArea instanceof HttpErrorResponse) {
                            this.showAlert = true;
                            setTimeout(() => { this.showAlert = false; }, 2000);
                        }
                        this._changeDetectorRef.markForCheck();
                    },
                );
        }
    });
  }

  showFlashMessage(type: 'success' | 'error'): void {
    this.flashMessage = type;
    this._changeDetectorRef.markForCheck();
    setTimeout(() => {
        this.flashMessage = null;
        this._changeDetectorRef.markForCheck();
    }, 3000);
  }

  closeDetails(): void {
    this.selectedRiskArea = null;
  }

  trackByFn(index: number, item: any): any {
    return item?.id ?? index;
  }

  ngAfterViewInit(): void {
    this._sort.sortChange
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._paginator.firstPage();
        this.closeDetails();
      });

    merge(this._sort.sortChange, this._paginator.page)
      .pipe(
        switchMap(() => {
          this.closeDetails();
          this.isLoading = true;
          this.query.size = this._paginator.pageSize;
          this.query.page = this._paginator.pageIndex + 1;
          this.query.sort = this._sort.active;
          this.query.order = (this._sort.direction || 'asc') as 'asc' | 'desc' | '';
          return this._riskAreaService.getRiskAreas(this.query);
        }),
        map(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(0);
    this._unsubscribeAll.complete();
  }
}
