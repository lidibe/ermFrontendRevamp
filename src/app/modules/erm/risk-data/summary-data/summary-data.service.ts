import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { SummaryData, RiskArea } from './summary-data.types';

@Injectable({
  providedIn: 'root',
})
export class SummaryDataService {
  // Private
  private _summaryData: BehaviorSubject<SummaryData | null> =
    new BehaviorSubject(null);
  private _summaryDatas: BehaviorSubject<SummaryData[] | null> =
    new BehaviorSubject(null);
  private _riskAreas: BehaviorSubject<RiskArea[] | null> = new BehaviorSubject(
    null
  );

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for kri
   */
  get summaryData$(): Observable<SummaryData> {
    return this._summaryData.asObservable();
  }

  /**
   * Getter for summaryDatas
   */
  get summaryDatas$(): Observable<SummaryData[]> {
    return this._summaryDatas.asObservable();
  }

  /**
   * Getter for countries
   */
  get riskAreas$(): Observable<RiskArea[]> {
    return this._riskAreas.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get summaryDatas
   */
  getSummaryDatas(query?: any): Observable<SummaryData[]> {
    const params = this.getParams(query);
    return this._httpClient
      .get<any>('/ms/api/v1/erm/summary-data', { params })
      .pipe(
        tap((res) => {
          this._summaryDatas.next(res.data);
        })
      );
  }

  getSummaryDatasNew(query?: any): Observable<SummaryData[]> {
    const params = this.getParams(query);
    return this._httpClient
      .get<any>('/ms/api/v1/erm/reporting/overall', { params })
      .pipe(
        tap((res) => {
          this._summaryDatas.next(res.data);
        })
      );
  }

  /**
   * Search summaryDatas with given query
   *
   * @param query
   */
  searchSummaryDatas(query: any): Observable<SummaryData[]> {
    const params = this.getParams(query);
    return this._httpClient
      .get<SummaryData[]>('/ms/api/v1/erm/summary-data', { params })
      .pipe(
        tap((summaryDatas) => {
          this._summaryDatas.next(summaryDatas);
        })
      );
  }

  /**
   * Get kri by id
   */
  getSummaryDataById(id: string): Observable<SummaryData> {
    return this._summaryDatas.pipe(
      take(1),
      map((summaryDatas) => {
        // Find the kri
        const kri = summaryDatas.find((item) => item.id === id) || null;
        // Update the kri
        this._summaryData.next(kri);
        // Return the kri
        return kri;
      }),
      switchMap((kri) => {
        if (!kri) {
          return throwError('Could not found kri with id of ' + id + '!');
        }
        return of(kri);
      })
    );
  }

  /**
   * Create kri
   */
  createSummaryData(data: SummaryData): Observable<SummaryData> {
    return this.summaryDatas$.pipe(
      debounceTime(500),
      take(1),
      switchMap((summaryDatas) =>
        this._httpClient
          .post<SummaryData>('/ms/api/v1/erm/summary-data', data)
          .pipe(
            map((newSummaryData) => {
              // Update the products with the new product
              this._summaryDatas.next([newSummaryData, ...summaryDatas]);
              // Return the new product
              return newSummaryData;
            })
          )
      ),
      catchError((error) => {
        // console.log('Caught search error the wrong way!');
        return of(error);
      })
    );
  }

  /**
   * Update kri
   *
   * @param id
   * @param kri
   */
  updateSummaryData(id: string, obj: SummaryData): Observable<SummaryData> {
    return this.summaryDatas$.pipe(
      take(1),
      switchMap((summaryDatas) =>
        this._httpClient
          .patch<SummaryData>(`/ms/api/v1/erm/summary-data/${id}`, {
            obj,
          })
          .pipe(
            map((updatedSummaryData) => {
              // Find the index of the updated kri
              const index = summaryDatas.findIndex((item) => item.id === id);
              // Update the kri
              summaryDatas[index] = updatedSummaryData;
              // Update the summaryDatas
              this._summaryDatas.next(summaryDatas);
              // Return the updated kri
              return updatedSummaryData;
            }),
            switchMap((updatedSummaryData) =>
              this.summaryData$.pipe(
                take(1),
                filter((item) => item && item.id === id),
                tap(() => {
                  // Update the kri if it's selected
                  this._summaryData.next(updatedSummaryData);
                  // Return the updated kri
                  return updatedSummaryData;
                })
              )
            )
          )
      )
    );
  }

  /**
   * Delete the Summary Data
   *
   * @param id
   */
  deleteSummaryData(id: string): Observable<boolean> {
    return this.summaryDatas$.pipe(
      take(1),
      switchMap((summaryDatas) =>
        this._httpClient
          .delete('/ms/api/v1/erm/summary-data/${id}', { params: { id } })
          .pipe(
            map((isDeleted: boolean) => {
              // Find the index of the deleted kri
              const index = summaryDatas.findIndex((item) => item.id === id);

              // Delete the kri
              summaryDatas.splice(index, 1);

              // Update the summaryDatas
              this._summaryDatas.next(summaryDatas);

              // Return the deleted status
              return isDeleted;
            })
          )
      )
    );
  }

  /**
   * Get countries
   */
  getRiskArea(): Observable<RiskArea[]> {
    return this._httpClient
      .get<any>('/ms/api/v1/erm/risk-area?page=1&size=100')
      .pipe(
        tap((res) => {
          this._riskAreas.next(res.data);
        })
      );
  }

  public getParams = (query: any) => {
    if (!query) {
      query = {
        page: 0,
        limit: 10,
      };
    }
    let params = new HttpParams();

    if (!query.page) {
      query.page = 0;
    }

    if (!query.size) {
      query.size = 10;
    }

    if (!query.limit) {
      query.limit = 10;
    }

    params = params
      .set('page', `${query.page}`)
      .set('limit', `${query.limit}`)
      .set('size', `${query.size}`);

    if (query.id) {
      params = params.set('id', `${query.id}`);
    }

    if (query.riskAreaId) {
      params = params.set('riskAreaId', `${query.riskAreaId}`);
    }

    if (query.kriId) {
      params = params.set('kriId', `${query.kriId}`);
    }

    if (query.sort) {
      params = params.set('sort', `${query.sort}`);
    }

    if (query.order) {
      params = params.set('sort', `${query.order}`);
    }

    if (query.name) {
      params = params.set('name', `${query.name}`);
    }

    if (query.month) {
      params = params.set('month', `${query.month}`);
    }

    if (query.year) {
      params = params.set('year', `${query.year}`);
    }

    return params;
  }
}
