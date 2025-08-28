import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {catchError, debounceTime, filter, map, switchMap, take, tap} from 'rxjs/operators';
import {Threshold, ThresholdPagination} from '../../models/threshold.model';
import {Kri} from '../kri/kri.types';
import {KriData} from '../../models/kri-data.model';

@Injectable({
    providedIn: 'root'
})
export class ThresholdService
{
    private _pagination: BehaviorSubject<ThresholdPagination | null> = new BehaviorSubject(null);
    private _threshold: BehaviorSubject<Threshold | null> = new BehaviorSubject(null);
    private _thresholds: BehaviorSubject<Threshold[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<ThresholdPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for product
     */
    get threshold$(): Observable<Threshold>
    {
        return this._threshold.asObservable();
    }

    /**
     * Getter for thresholds
     */
    get thresholds$(): Observable<Threshold[]>
    {
        return this._thresholds.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get risk areas
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getThresholds(query: any):
        Observable<{ pagination: ThresholdPagination, data: Threshold[] }> {
        const params = this.getParams(query);
        return this._httpClient.get<{ pagination: ThresholdPagination, data: Threshold[] }>('/ms/api/v1/erm/threshold', {
            params
        }).pipe(
            tap((response) => {
                console.log('----------> Thresholds -->', response);
                this._pagination.next(response.pagination);
                this._thresholds.next(response.data);
            })
        );
    }


    /**
     * Get risk areas
     */
    getThresholdsCustom(kri: string, month: string, year: string): Observable<{ count: number, data: Threshold[] }>
    {
        return this._httpClient.get<{ count: number, data: Threshold[] }>('/ms/api/v1/erm/threshold/custom', {
            params: {
                kri,
                month,
                year
            }
        }).pipe(
            tap((response) => {
                console.log('----------> Thresholds -->', response);
                this._thresholds.next(response.data);
            })
        );
    }

    /**
     * Get product by id
     */
    getThresholdById(id: string): Observable<Threshold>
    {
        return this._thresholds.pipe(
            take(1),
            map((thresholds) => {

                // console.log('thresholds', thresholds);
                // Find the product
                const threshold = thresholds.find(item => item.id === id) || null;

                // Update the product
                this._threshold.next(threshold);

                // Return the product
                return threshold;
            }),
            switchMap((threshold) => {

                if ( !threshold )
                {
                    return throwError('Could not found risk area with id of ' + id + '!');
                }

                return of(threshold);
            })
        );
    }

    /**
     * Create Threshold
     */
    createThreshold(data: Threshold): Observable<Threshold>
    {
        return this.thresholds$.pipe(
            debounceTime(500),
            take(1),
            switchMap((thresholds) => this._httpClient.post<Threshold>('/ms/api/v1/erm/threshold', data)
                .pipe(
                    map((newThreshold) => {

                        // Update the products with the new Threshold
                        this._thresholds.next([newThreshold, ...thresholds]);

                        // Return the new Threshold
                        return newThreshold;
                    })
                )),
            catchError(error => {
                // console.log('Caught search error the wrong way!');
                return of(error);
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param threshold
     */
    updateThreshold(id: string, threshold: Threshold): Observable<Threshold>
    {
        return this.thresholds$.pipe(
            take(1),
            switchMap(thresholds => this._httpClient.patch<Threshold>(`/ms/api/v1/erm/threshold/${id}`,
                threshold
            ).pipe(
                map((updatedThreshold) => {

                    // Find the index of the updated product
                    const index = thresholds.findIndex(item => item.id === id);

                    // Update the product
                    thresholds[index] = updatedThreshold;

                    // Update the thresholds
                    this._thresholds.next(thresholds);

                    // Return the updated product
                    return updatedThreshold;
                }),
                switchMap(updatedThreshold => this.threshold$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the product if it's selected
                        this._threshold.next(updatedThreshold);

                        // Return the updated product
                        return updatedThreshold;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the product
     *
     * @param id
     */
    deleteThreshold(id: string): Observable<boolean>
    {
        return this.thresholds$.pipe(
            take(1),
            switchMap(thresholds => this._httpClient.delete('api/apps/ecommerce/inventory/product', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted product
                    const index = thresholds.findIndex(item => item.id === id);

                    // Delete the product
                    thresholds.splice(index, 1);

                    // Update the thresholds
                    this._thresholds.next(thresholds);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    public getParams = (query: any) => {
        let params = new HttpParams();
        if (!query.page) {
            query.page = 1;
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
