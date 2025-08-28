import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { RiskArea, RiskAreaPagination } from '../../models/risk-area.model';

@Injectable({ providedIn: 'root' })
export class RiskAreaService {
  private _pagination: BehaviorSubject<RiskAreaPagination | null> = new BehaviorSubject<RiskAreaPagination | null>(null);
  private _riskArea: BehaviorSubject<RiskArea | null> = new BehaviorSubject<RiskArea | null>(null);
  private _riskAreas: BehaviorSubject<RiskArea[] | null> = new BehaviorSubject<RiskArea[] | null>(null);

  constructor(private _httpClient: HttpClient) {}

  get pagination$(): Observable<RiskAreaPagination> {
    return this._pagination.asObservable();
  }

  get riskArea$(): Observable<RiskArea> {
    return this._riskArea.asObservable();
  }

  get riskAreas$(): Observable<RiskArea[]> {
    return this._riskAreas.asObservable();
  }

  // ✅ query is now optional; callers may pass nothing
  getRiskAreas(query: any = {}): Observable<{ pagination: RiskAreaPagination; data: RiskArea[] }> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))           // API 1-based
      .set('size', String(query.size ?? 10))
      .set('sort', String(query.sort ?? 'name'))
      .set('order', String(query.order ?? 'asc'));

    if (query.search) params = params.set('search', String(query.search));
    if (query.name)   params = params.set('name', String(query.name));
    if (query.code)   params = params.set('code', String(query.code));

    return this._httpClient
      .get<{ pagination: RiskAreaPagination; data: RiskArea[] }>('/ms/api/v1/erm/risk-area', { params })
      .pipe(
        tap((response) => {
          this._pagination.next(response.pagination);
          this._riskAreas.next(response.data);
        })
      );
  }

  getRiskAreaById(id: string): Observable<RiskArea> {
    return this._riskAreas.pipe(
      take(1),
      map((riskAreas) => {
        const riskArea = (riskAreas ?? []).find((item) => item.id === id) ?? null;
        this._riskArea.next(riskArea);
        return riskArea;
      }),
      switchMap((riskArea) => {
        if (!riskArea) {
          return throwError(() => new Error('Could not found risk area with id of ' + id + '!'));
        }
        return of(riskArea);
      })
    );
  }

  createRiskType(data: RiskArea): Observable<RiskArea> {
    return this.riskAreas$.pipe(
      take(1),
      switchMap((riskAreas) =>
        this._httpClient.post<RiskArea>('/ms/api/v1/erm/risk-area', data).pipe(
          map((newRiskArea) => {
            this._riskAreas.next([newRiskArea, ...(riskAreas ?? [])]);
            return newRiskArea;
          })
        )
      ),
      catchError((error) => of(error))
    );
  }

  updateProduct(id: string, riskArea: RiskArea): Observable<RiskArea> {
    return this.riskAreas$.pipe(
      take(1),
      switchMap((riskAreas) =>
        this._httpClient.patch<RiskArea>(`/ms/api/v1/erm/risk-area/${id}`, riskArea).pipe(
          map((updatedRiskArea) => {
            const list = [...(riskAreas ?? [])];
            const index = list.findIndex((item) => item.id === id);
            if (index > -1) list[index] = updatedRiskArea;
            this._riskAreas.next(list);
            return updatedRiskArea;
          }),
          switchMap((updatedRiskArea) =>
            this.riskArea$.pipe(
              take(1),
              filter((item) => !!item && item.id === id),
              tap(() => this._riskArea.next(updatedRiskArea))
            )
          )
        )
      )
    );
  }

  deleteProduct(id: string): Observable<boolean> {
    return this.riskAreas$.pipe(
      take(1),
      switchMap((riskAreas) =>
        this._httpClient.delete<boolean>(`/ms/api/v1/erm/risk-area/${id}`).pipe(
          map((isDeleted) => {
            const list = [...(riskAreas ?? [])];
            const index = list.findIndex((item) => item.id === id);
            if (index > -1) list.splice(index, 1);
            this._riskAreas.next(list);
            return isDeleted;
          })
        )
      )
    );
  }

  updateRiskType(id: string, threshold: RiskArea): Observable<RiskArea> {
    return this.riskAreas$.pipe(
      take(1),
      switchMap((riskAreas) =>
        this._httpClient.patch<RiskArea>(`/ms/api/v1/erm/risk-area/${id}`, threshold).pipe(
          map((updatedRiskArea) => {
            const list = [...(riskAreas ?? [])];
            const index = list.findIndex((item) => item.id === id);
            if (index > -1) list[index] = updatedRiskArea;
            this._riskAreas.next(list);
            return updatedRiskArea;
          }),
          switchMap((updatedRiskArea) =>
            this.riskArea$.pipe(
              take(1),
              filter((item) => !!item && item.id === id),
              tap(() => this._riskArea.next(updatedRiskArea))
            )
          )
        )
      )
    );
  }
}
