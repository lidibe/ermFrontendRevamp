import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Page, PageOptions } from 'app/shared/types/paging.types';
import { SearchOptions } from 'app/shared/types/searching.types';
import { combineLatest, EMPTY, Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { OrderOptionsEnum } from 'app/shared/types/order.types';
import { Trail } from 'app/shared/types/trail.types';
import { Organization } from './organizations.types';

const baseUrl = '/ms/api/v1/bose/organization';

function newOrganization(): Organization {
  return {
    name: '',
    description: ''
  }
}

function getRequestParams(options: [PageOptions, SearchOptions]): Record<string, string> {
  const [paging, searching] = options;
  const params = {
    page: paging?.page?.toString(),
    limit: paging?.limit?.toString(),
    sort_order: (paging.sort_order ?? OrderOptionsEnum.DESC).toString(),
  };
  if (searching && searching.search)
    params['search'] = searching.search;
  return params;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {
  constructor(
    private _httpClient: HttpClient
  ) { }

/*   getOrganizations(
    paging: Observable<PageOptions>,
    searching?: Observable<SearchOptions>,
  ): Observable<Page<Organization>> {
    let search = searching;
    if (!searching) search = EMPTY;
    const page = paging.pipe(startWith({ page: 1, limit: 10, sort_order: OrderOptionsEnum.DESC }));
    search = search.pipe(startWith(null as SearchOptions));
    return combineLatest([page, search]).pipe(
      map(getRequestParams),
      switchMap(params => this._httpClient.get<Page<Organization>>(`${baseUrl}`, { params })),
    );
  } */
    getOrganizations(
      paging: Observable<PageOptions>,
      searching?: Observable<SearchOptions>
    ): Observable<Page<Organization>> {
      let search = searching;
      if (!searching) search = EMPTY;
    
      const page = paging.pipe(startWith({ page: 1, limit: 10, sort_order: OrderOptionsEnum.DESC }));
      search = search.pipe(startWith(null as SearchOptions));
    
      return combineLatest([page, search]).pipe(
        map(getRequestParams),
        switchMap(params =>
          this._httpClient.get<Page<Organization>>(`${baseUrl}`, { params }).pipe(
            catchError(() => EMPTY
            )
          )
        )
      );
    }

  getOrganizationById(id: string): Observable<Organization> {
    if (id === 'new') return of(newOrganization());
    return this._httpClient.get<Organization>(`${baseUrl}/${id}`);
  }

  updateOrganization(Organization: Organization): Observable<Organization> {
    return this._httpClient.patch<Organization>(`${baseUrl}/${Organization?.code}`, Organization);
  }

  deleteOrganizationById(code: string, body: {[key: string]: string}): Observable<Organization> {
    return this._httpClient.delete<Organization>(`${baseUrl}/${code}`, { body });
  }

  createOrganization(form: Organization): Observable<any> {
    const newOrganization = { ...form }
    delete newOrganization._id;
    delete newOrganization.code;
    return this._httpClient.post<Organization>(`${baseUrl}`, newOrganization);
  }

  getOrganizationTrails(code: string): Observable<Trail[]> {
    return this._httpClient.get<Trail[]>(`${baseUrl}/${code}/events`)
  }

  unArchiveOrganization(code: string): Observable<Organization> {
    const url = `${baseUrl}/${code}/unarchive`;
    return this._httpClient.patch<Organization>(url, {is_deleted: false});
  }
}
