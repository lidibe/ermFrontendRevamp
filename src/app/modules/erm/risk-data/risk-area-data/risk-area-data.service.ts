import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {catchError, debounceTime, filter, map, switchMap, take, tap} from 'rxjs/operators';
import {RiskAreaData, RiskAreaDataPagination} from '../../models/risk-area-data.model';
import {ToastrService} from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class RiskAreaDataService
{
    // Private
    private _pagination: BehaviorSubject<RiskAreaDataPagination | null> = new BehaviorSubject(null);
    private _riskAreaData: BehaviorSubject<RiskAreaData | null> = new BehaviorSubject(null);
    private _riskAreaDatas: BehaviorSubject<RiskAreaData[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private  _toastr: ToastrService, )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<RiskAreaDataPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for risk area
     */
    get riskAreaData$(): Observable<RiskAreaData>
    {
        return this._riskAreaData.asObservable();
    }

    /**
     * Getter for risk areas
     */
    get riskAreaDatas$(): Observable<RiskAreaData[]>
    {
        return this._riskAreaDatas.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get risk areas
     *
     * @param query
     */
    getRiskAreaDatas(query: any):
        Observable<{ pagination: RiskAreaDataPagination, data: RiskAreaData[] }>
    {
        const params = this.getParams(query);
        return this._httpClient.get<{ pagination: RiskAreaDataPagination, data: RiskAreaData[] }>('/ms/api/v1/erm/risk-area-data', {
            params
        }).pipe(
            tap((response) => {
                console.log('response', response);
                this._pagination.next(response.pagination);
                this._riskAreaDatas.next(response.data);
            })
        );
    }

    /**
     * Get kri data by id
     */
    getRiskAreaDataById(id: string): Observable<RiskAreaData>
    {
        return this._riskAreaDatas.pipe(
            take(1),
            map((riskAreaDatas) => {

                const riskAreaData = riskAreaDatas.find(item => item.id === id) || null;

                // Update the risk area
                this._riskAreaData.next(riskAreaData);

                // Return the risk area
                return riskAreaData;
            }),
            switchMap((riskAreaData) => {

                if ( !riskAreaData )
                {
                    return throwError('Could not found risk area with id of ' + id + '!');
                }

                return of(riskAreaData);
            })
        );
    }

    /**
     * Create risk area
     */
    createRiskAreaData(data: RiskAreaData): Observable<RiskAreaData>
    {
        return this.riskAreaDatas$.pipe(
            debounceTime(500),
            take(1),
            switchMap((riskAreaDatas) => this._httpClient.post<RiskAreaData>('/ms/api/v1/erm/risk-area-data', data)
                .pipe(
                    map((newRiskAreaData) => {

                        // Update the risk areas with the new risk area
                        this._riskAreaDatas.next([newRiskAreaData, ...riskAreaDatas]);

                        // Return the new risk area
                        return newRiskAreaData;
                    })
                )),
            catchError(error => {
                // console.log('Caught search error the wrong way!');
                return of(error);
            })
            );
    }

    /**
     * Update risk area
     *
     * @param id
     * @param riskAreaData
     */
    updateRiskAreaData(id: string, riskAreaData: RiskAreaData): Observable<RiskAreaData>
    {
        return this.riskAreaDatas$.pipe(
            take(1),
            switchMap(riskAreaDatas => this._httpClient.patch<RiskAreaData>(`/ms/api/v1/erm/risk-area-data/${id}`, {
                data: riskAreaData
            }).pipe(
                map((updatedRiskAreaData) => {

                    // Find the index of the updated risk area
                    const index = riskAreaDatas.findIndex(item => item.id === id);

                    // Update the risk area
                    riskAreaDatas[index] = updatedRiskAreaData;

                    // Update the risk areas
                    this._riskAreaDatas.next(riskAreaDatas);

                    // Return the updated risk area
                    return updatedRiskAreaData;
                }),
                switchMap(updatedRiskAreaData => this.riskAreaData$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the risk area if it's selected
                        this._riskAreaData.next(updatedRiskAreaData);

                        // Return the updated risk area
                        return updatedRiskAreaData;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the risk area
     *
     * @param id
     */
    deleteRiskAreaData(id: string): Observable<boolean>
    {
        return this.riskAreaDatas$.pipe(
            take(1),
            switchMap(riskAreas => this._httpClient.delete('api/apps/ecommerce/inventory/risk-area', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted risk area
                    const index = riskAreas.findIndex(item => item.id === id);

                    // Delete the risk area
                    riskAreas.splice(index, 1);

                    // Update the risk areas
                    this._riskAreaDatas.next(riskAreas);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    public getParams = (query: any) => {
        let params = new HttpParams();

        if (!query.page) {
            query.page = 0;
        }

        if (!query.size) {
            query.size = 10;
        }

        params = params
            .set('page', `${query.page}`)
            .set('size', `${query.size}`);

        if (query.id) {
            params = params.set('id', `${query.id}`);
        }

        if (query.riskAreaId) {
            params = params.set('riskAreaId', `${query.riskAreaId}`);
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
