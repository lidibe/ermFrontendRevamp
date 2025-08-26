import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import {RiskArea, RiskAreaPagination} from '../../models/risk-area.model';

@Injectable({
    providedIn: 'root'
})
export class RiskAreaService
{
    // Private
    private _pagination: BehaviorSubject<RiskAreaPagination | null> = new BehaviorSubject(null);
    private _riskArea: BehaviorSubject<RiskArea | null> = new BehaviorSubject(null);
    private _riskAreas: BehaviorSubject<RiskArea[] | null> = new BehaviorSubject(null);

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
    get pagination$(): Observable<RiskAreaPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for product
     */
    get riskArea$(): Observable<RiskArea>
    {
        return this._riskArea.asObservable();
    }

    /**
     * Getter for products
     */
    get riskAreas$(): Observable<RiskArea[]>
    {
        return this._riskAreas.asObservable();
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
    getRiskAreas(page: number = 0, size: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: RiskAreaPagination, data: RiskArea[] }>
    {
        return this._httpClient.get<{ pagination: RiskAreaPagination, data: RiskArea[] }>('/ms/api/v1/erm/risk-area', {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search
            }
        }).pipe(
            tap((response) => {
                // console.log('----------> Risk areas -->', response);
                this._pagination.next(response.pagination);
                this._riskAreas.next(response.data);
            })
        );
    }
    /*getRiskAreas(): Observable<{ pagination: RiskAreaPagination, data: RiskArea[] }>
    {
        return this._httpClient.get<any>('/ms/api/v1/erm/risk-area?page=1&size=100')
            .pipe(
                tap((res) => {
                    // this._riskAreas.next(res.data);
                    console.log('>>>res------------> ', res);
                    this._pagination.next(res.pagination);
                    this._riskAreas.next(res.data);
                })
            );
    }*/

    /**
     * Get product by id
     */
    getRiskAreaById(id: string): Observable<RiskArea>
    {
        return this._riskAreas.pipe(
            take(1),
            map((riskAreas) => {

                // console.log('riskAreas', riskAreas);
                // Find the product
                const riskArea = riskAreas.find(item => item.id === id) || null;

                // Update the product
                this._riskArea.next(riskArea);

                // Return the product
                return riskArea;
            }),
            switchMap((riskArea) => {

                if ( !riskArea )
                {
                    return throwError('Could not found risk area with id of ' + id + '!');
                }

                return of(riskArea);
            })
        );
    }

    createRiskType(data: RiskArea): Observable<RiskArea>
    {
        return this.riskAreas$.pipe(
            take(1),
            switchMap((riskAreas) => this._httpClient.post<RiskArea>('/ms/api/v1/erm/risk-area', data)
                .pipe(
                    map((newRiskArea) => {
                        this._riskAreas.next([newRiskArea, ...riskAreas]);
                        return newRiskArea;
                    })
                )),
            catchError(error => {
                return of(error);
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param riskArea
     */
    updateProduct(id: string, riskArea: RiskArea): Observable<RiskArea>
    {
        return this.riskAreas$.pipe(
            take(1),
            switchMap(riskAreas => this._httpClient.patch<RiskArea>('api/apps/ecommerce/inventory/product', {
                id,
                riskArea
            }).pipe(
                map((updatedRiskArea) => {

                    // Find the index of the updated product
                    const index = riskAreas.findIndex(item => item.id === id);

                    // Update the product
                    riskAreas[index] = updatedRiskArea;

                    // Update the products
                    this._riskAreas.next(riskAreas);

                    // Return the updated product
                    return updatedRiskArea;
                }),
                switchMap(updatedRiskArea => this.riskArea$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the product if it's selected
                        this._riskArea.next(updatedRiskArea);

                        // Return the updated product
                        return updatedRiskArea;
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
    deleteProduct(id: string): Observable<boolean>
    {
        return this.riskAreas$.pipe(
            take(1),
            switchMap(products => this._httpClient.delete('api/apps/ecommerce/inventory/product', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted product
                    const index = products.findIndex(item => item.id === id);

                    // Delete the product
                    products.splice(index, 1);

                    // Update the products
                    this._riskAreas.next(products);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    updateRiskType(id: string, threshold: RiskArea): Observable<RiskArea>
    {
        return this.riskAreas$.pipe(
            take(1),
            switchMap(riskAreas => this._httpClient.patch<RiskArea>(`/ms/api/v1/erm/risk-area/${id}`,
                threshold
            ).pipe(
                map((updatedRiskArea) => {
                    const index = riskAreas.findIndex(item => item.id === id);
                    riskAreas[index] = updatedRiskArea;
                    this._riskAreas.next(riskAreas);
                    return updatedRiskArea;
                }),
                switchMap(updatedRiskArea => this.riskArea$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {
                        this._riskArea.next(updatedRiskArea);
                        return updatedRiskArea;
                    })
                ))
            ))
        );
    }
}
