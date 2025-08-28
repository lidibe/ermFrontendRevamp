import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {catchError, debounceTime, filter, map, switchMap, take, tap} from 'rxjs/operators';
import {KriData, KriDataPagination} from '../../models/kri-data.model';
import {ToastrService} from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class KriDataService
{
    // Private
    private _pagination: BehaviorSubject<KriDataPagination | null> = new BehaviorSubject(null);
    private _kriData: BehaviorSubject<KriData | null> = new BehaviorSubject(null);
    private _kriDatas: BehaviorSubject<KriData[] | null> = new BehaviorSubject(null);
    private _myGroupKriDatas: BehaviorSubject<KriData[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private  _toastr: ToastrService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<KriDataPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for product
     */
    get kriData$(): Observable<KriData>
    {
        return this._kriData.asObservable();
    }

    /**
     * Getter for products
     */
    get kriDatas$(): Observable<KriData[]>
    {
        return this._kriDatas.asObservable();
    }

    /**
     * Getter for products
     */
    get myGroupKriDatas$(): Observable<KriData[]>
    {
        return this._myGroupKriDatas.asObservable();
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
    getKriDatas(query):
        Observable<{ pagination: KriDataPagination, data: KriData[] }>
    {
        const params = this.getParams(query);
        return this._httpClient.get<{ pagination: KriDataPagination, data: KriData[] }>('/ms/api/v1/erm/kri-data', {
            params
        }).pipe(
            tap((response) => {
                // console.log('----------> Risk areas -->', response);
                this._pagination.next(response.pagination);
                this._kriDatas.next(response.data);
            })
        );
    }

    getMyGroupKriDatas(query):
        Observable<{ pagination: KriDataPagination, data: KriData[] }>
    {
        const params = this.getParams(query);
        return this._httpClient.get<{ pagination: KriDataPagination, data: KriData[] }>('/ms/api/v1/my/erm/kri-data', {
            params
        }).pipe(
            tap((response) => {
                // console.log('----------> Risk areas -->', response);
                this._pagination.next(response.pagination);
                this._myGroupKriDatas.next(response.data);
            })
        );
    }

    /**
     * Get kri data by id
     */
    getKriDataById(id: string): Observable<KriData>
    {
        return this._kriDatas.pipe(
            take(1),
            map((kriDatas) => {

                console.log('kriDatas', kriDatas);
                // Find the product
                const kriData = kriDatas.find(item => item.id === id) || null;

                // Update the product
                this._kriData.next(kriData);

                // Return the product
                return kriData;
            }),
            switchMap((kriData) => {

                if ( !kriData )
                {
                    return throwError('Could not found risk area with id of ' + id + '!');
                }

                return of(kriData);
            })
        );
    }

    /**
     * Get kri data by id
     */
    getMyGroupKriDataById(id: string): Observable<KriData>
    {
        return this._myGroupKriDatas.pipe(
            take(1),
            map((kriDatas) => {

                console.log('kriDatas', kriDatas);
                // Find the product
                const kriData = kriDatas.find(item => item.id === id) || null;

                // Update the product
                this._kriData.next(kriData);

                // Return the product
                return kriData;
            }),
            switchMap((kriData) => {

                if ( !kriData )
                {
                    return throwError('Could not found risk area with id of ' + id + '!');
                }

                return of(kriData);
            })
        );
    }

    /**
     * Create product
     */
    createKriData(data: KriData): Observable<KriData>
    {
        return this.kriDatas$.pipe(
            debounceTime(500),
            take(1),
            switchMap((kriDatas) => this._httpClient.post<KriData>('/ms/api/v1/erm/kri-data', data)
                .pipe(
                    map((newKriData) => {

                        // Update the products with the new product
                        this._kriDatas.next([newKriData, ...kriDatas]);

                        // Return the new product
                        return newKriData;
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
     * @param kriData
     */
    updateKriData(id: string, kriData: KriData): Observable<KriData>
    {
        return this.kriDatas$.pipe(
            take(1),
            switchMap(kriDatas => this._httpClient.patch<KriData>(`/ms/api/v1/erm/kri-data/${id}`, {
                ...kriData
            }).pipe(
                map((updatedKriData) => {

                    // Find the index of the updated product
                    const index = kriDatas.findIndex(item => item.id === id);

                    // Update the product
                    kriDatas[index] = updatedKriData;

                    // Update the products
                    this._kriDatas.next(kriDatas);

                    // Return the updated product
                    return updatedKriData;
                }),
                switchMap(updatedKriData => this.kriData$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the product if it's selected
                        this._kriData.next(updatedKriData);

                        // Return the updated product
                        return updatedKriData;
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
    deleteKriData(id: string): Observable<boolean>
    {
        return this.kriDatas$.pipe(
            take(1),
            switchMap(products => this._httpClient.delete('api/apps/ecommerce/inventory/product', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted product
                    const index = products.findIndex(item => item.id === id);

                    // Delete the product
                    products.splice(index, 1);

                    // Update the products
                    this._kriDatas.next(products);

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
