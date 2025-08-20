import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {catchError, debounceTime, filter, map, switchMap, take, tap} from 'rxjs/operators';
import {Kri, RiskArea} from './kri.types';
import {KriData} from '../../models/kri-data.model';

@Injectable({
    providedIn: 'root'
})
export class KriService
{
    // Private
    private _kri: BehaviorSubject<Kri | null> = new BehaviorSubject(null);
    private _kris: BehaviorSubject<Kri[] | null> = new BehaviorSubject(null);
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
     * Getter for kri
     */
    get kri$(): Observable<Kri>
    {
        return this._kri.asObservable();
    }

    /**
     * Getter for kris
     */
    get kris$(): Observable<Kri[]>
    {
        return this._kris.asObservable();
    }

    /**
     * Getter for countries
     */
    get riskAreas$(): Observable<RiskArea[]>
    {
        return this._riskAreas.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get kris
     */
    getKris(): Observable<Kri[]>
    {
        return this._httpClient.get<any>('/ms/api/v1/erm/kri?page=1&limit=100').pipe(
            tap((res) => {
                this._kris.next(res.data);
            })
        );
    }

    /**
     * Get kris
     */
    getMyGroupKris(): Observable<Kri[]>
    {
        return this._httpClient.get<any>(`/ms/api/v1/my/erm/kri?page=1&limit=100`).pipe(
            tap((res) => {
                this._kris.next(res.data);
            })
        );
    }

    /**
     * Search kris with given query
     *
     * @param query
     */
    searchKris(query: any): Observable<Kri[]>
    {
        const params = this.getParams(query);
        return this._httpClient.get<Kri[]>('/ms/api/v1/erm/kri', {params}).pipe(
            tap((kris) => {
                this._kris.next(kris);
            })
        );
    }

    /**
     * Get kri by id
     */
    getKriById(id: string): Observable<Kri>
    {
        return this._kris.pipe(
            take(1),
            map((kris) => {
                // Find the kri
                const kri = kris.find(item => item.id === id) || null;
                // Update the kri
                this._kri.next(kri);
                // Return the kri
                return kri;
            }),
            switchMap((kri) => {
                if ( !kri )
                {
                    return throwError('Could not found kri with id of ' + id + '!');
                }
                return of(kri);
            })
        );
    }

    /**
     * Create kri
     */
    createKri(data: Kri): Observable<KriData>
    {
        return this.kris$.pipe(
            debounceTime(500),
            take(1),
            switchMap((kris) => this._httpClient.post<Kri>('/ms/api/v1/erm/kri', data)
                .pipe(
                    map((newKri) => {
                        // Update the products with the new product
                        this._kris.next([newKri, ...kris]);
                        // Return the new product
                        return newKri;
                    })
                )),
            catchError(error => {
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
    updateKri(id: string, kri: Kri): Observable<Kri>
    {
        return this.kris$.pipe(
            take(1),
            switchMap(kris => this._httpClient.patch<Kri>(`/ms/api/v1/erm/kri/${id}`, {
                kri
            }).pipe(
                map((updatedKri) => {
                    // Find the index of the updated kri
                    const index = kris.findIndex(item => item.id === id);
                    // Update the kri
                    kris[index] = updatedKri;
                    // Update the kris
                    this._kris.next(kris);
                    // Return the updated kri
                    return updatedKri;
                }),
                switchMap(updatedKri => this.kri$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {
                        // Update the kri if it's selected
                        this._kri.next(updatedKri);
                        // Return the updated kri
                        return updatedKri;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the kri
     *
     * @param id
     */
    deleteKri(id: string): Observable<boolean>
    {
        return this.kris$.pipe(
            take(1),
            switchMap(kris => this._httpClient.delete('api/apps/kris/kri', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted kri
                    const index = kris.findIndex(item => item.id === id);

                    // Delete the kri
                    kris.splice(index, 1);

                    // Update the kris
                    this._kris.next(kris);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get countries
     */
    getRiskArea(): Observable<RiskArea[]>
    {
        return this._httpClient.get<any>('/ms/api/v1/erm/risk-area?page=1&size=100').pipe(
            tap((res) => {
                this._riskAreas.next(res.data);
            })
        );
    }

    public getParams = (query: any) => {
        console.log('query', query);
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

        if (query.q) {
            params = params.set('q', `${query.q}`);
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
