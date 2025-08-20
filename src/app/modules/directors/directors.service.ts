import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Page, PageOptions } from 'app/shared/types/paging.types';
import { SearchOptions } from 'app/shared/types/searching.types';
import moment from 'moment';
import { combineLatest, EMPTY, from, Observable, of } from 'rxjs';
import { expand, map, mergeMap, reduce, startWith, switchMap, toArray } from 'rxjs/operators';
import { CommitteesService } from '../committees/committees.service';
import { Committee } from '../committees/committees.types';
import {DocumentService} from "../../shared/services/document.service";
import {
    AccountDetail,
    Country,
    Director,
    DirectorClass,
    DirectorLanguage,
    DirectorStatus,
    DirectorTerm,
    DirectorTitle,
    DirectorType,
    IdCard
} from "./directors.types";
import { OrderOptionsEnum } from 'app/shared/types/order.types';
import { Trail } from 'app/shared/types/trail.types';
import { DocumentPayload } from 'app/shared/types/file.types';

const baseUrl = '/ms/api/v1/bose/director';

function newDirector(): Director {
    return {
        title: '',
        firstname: '',
        lastname: '',
        email: '',
        email2: '',
        telephone: '',
        mobile: '',
        fax: '',
        citizenship: [],
        position: '',
        institution: '',
        billing_address: {
            line1: '',
            line2: '',
            line3: '',
            city: '',
            locality: '',
            state: '',
            postcode: '',
            country: '',
        },
        shipping_address: {
            line1: '',
            line2: '',
            line3: '',
            city: '',
            locality: '',
            state: '',
            postcode: '',
            country: '',
        },
        assistant: {
            firstname: '',
            lastname: '',
            email: '',
            telephone: '',
            mobile: '',
            fax: '',
        },
        facebook: '',
        twitter: '',
        linkedin: '',
        youtube: '',
        shareholding_class: '',
        language: '',
        picture: '',
        terms: [],
        ids: [],
        type: 'substantive',
        hiring_date: '',
        organization: '',
        bank_details: [],
        reason_for_deletion:  '',
    };
}

function getRequestParams(options: [PageOptions, SearchOptions]): Record<string, string> {
    const [paging, searching] = options;
  
    const params = {
      page: paging.page.toString(),
      limit: paging.limit.toString(),
      sort_order: (paging.sort_order ?? OrderOptionsEnum.DESC).toString(),
      ...Object.entries(searching || {})
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .reduce((acc, [key, value]) => {
          acc[key] = value.toString();
          return acc;
        }, {})
    };
  
    return params;
  }

@Injectable({
    providedIn: 'root'
})
export class DirectorsService {
    constructor(
        private _committeeService: CommitteesService,
        private _documentService: DocumentService,
        private _httpClient: HttpClient,
    ) { }

    getDirectorRoles(): Observable<any[]> {
        return of([{
            label: 'Chairman',
            value: 'CHAIRMAN'
        }, {
            label: 'Member',
            value: 'MEMBER'
        }]);
    }

    getDirectorClasses(): Observable<DirectorClass[]> {
        return of([{
            code: 'a',
            label: 'A',
        }, {
            code: 'b',
            label: 'B',
        }, {
            code: 'c',
            label: 'C',
        }, {
            code: 'd',
            label: 'D',
        }, {
            code: 'independent',
            label: 'Independent',
        }]);
    }

    getDirectorLanguages(): Observable<DirectorLanguage[]> {
        return of([{
            code: 'en',
            label: 'English',
        }, {
            code: 'fr',
            label: 'French',
        }]);
    }

    getDirectorTitles(): Observable<DirectorTitle[]> {
        return of([
            'dr',
            'prof',
            'mr',
            'mrs',
            'ms',
        ]);
    }

    getDirectorTypes(): Observable<DirectorType[]> {
        return of([
            'alternate',
            'substantive',
        ]);
    }

    getDirectorStatus(): Observable<DirectorStatus[]> {
        return of([
            'ACTIVE',
            'INACTIVE',
        ]);
    }

    getDirectors(
        paging: Observable<PageOptions>,
        searching?: Observable<SearchOptions>,
    ): Observable<Page<Director>> {
        let search = searching;
        if (!searching) {
            search = EMPTY;
        }
        const page = paging.pipe(startWith({ page: 1, limit: 10, sort_order: OrderOptionsEnum.DESC }));
        search = search.pipe(startWith(null as SearchOptions));
        return combineLatest([page, search]).pipe(
            map(getRequestParams),
            switchMap(params => this._httpClient.get<Page<Director>>(`${baseUrl}`, { params })),
        );
    }

    getAllDirectors(): Observable<Director[]> {
        let count = 0;
        return this.getDirectors(of({ page: 1, limit: 100 }))
            .pipe(
                expand(page => {
                    count += page.data.length;
                    if (count === page.count) {
                        return EMPTY;
                    }
                    else{
                        return this.getDirectors(of({
                            page: parseInt(page.page, 10) + 1,
                            limit: parseInt(page.limit, 10),
                        }));
                    }
                }),
                reduce((all, page) => all.concat(page.data), [ ]),
            );
    }

    getAllNonDeletedDirectors(): Observable<Director[]> {
        return this.getAllDirectors()
            .pipe(
                map(directors => directors.filter(item => !item.is_deleted)),
            );
    }

    getDirectorById(id: string): Observable<Director> {
        if (id === 'new') {
            return of(newDirector());
        }
        return this._httpClient.get<Director>(`${baseUrl}/${id}`).pipe(
        // TODO: Remove this logic block when the backend changes citizenship attribute from string to an array of strings
          map(director => {
            // Check if the citizenship is a string
            if (typeof director.citizenship === 'string') {
              // Convert the string to an array with a single element
              director.citizenship = [director.citizenship];
            }
            return director;
          })
        );
      }

    createDirector(director: Director): Observable<Director> {
        return this._httpClient.post<Director>(baseUrl, director);
    }

    updateDirector(id: string, director: Director): Observable<Director> {
        return this._httpClient.patch<Director>(`${baseUrl}/${id}`, director);
    }

    deleteDirector(code: string, body: {[key: string]: string}): Observable<Director> {
        return this._httpClient.delete<Director>(`${baseUrl}/${code}`, {body});
    }

    getCountries(): Observable<Country[]> {
        return this._httpClient.get<Country[]>('api/apps/contacts/countries');
    }

    getDirectorCommittees(directorCode: string): Observable<Committee[]> {
        return this._committeeService.getDirectorCommittees(directorCode);
    }

    getProfileImage(imageCode: string): Observable<any> {
        return this._documentService.get(imageCode);
    }

    uploadProfileImage(file: File): Observable<string> {
        return this._documentService.upload(file);
    }

    updateProfileImage(directorCode: string, imageCode: string): Observable<Director> {
        const url = `${baseUrl}/${directorCode}/picture`;
        return this._httpClient.patch<Director>(url, { picture: imageCode });
    }

    createDirectorTerm(directorCode: string, term: DirectorTerm): Observable<DirectorTerm> {
        const url = `${baseUrl}/${directorCode}/term`;
        return this._httpClient.post<Director>(url, term)
            .pipe(
                map(director => director.terms.find(t => {
                    return t.from === moment(term.from).toISOString()
                        && t.to === moment(term.to).toISOString()
                })),
            );
    }

    deleteDirectorTerm(directorCode: string, termCode: string): Observable<DirectorTerm> {
        const url = `${baseUrl}/${directorCode}/term/${termCode}`;
        return this._httpClient.delete<DirectorTerm>(url);
    }

    createDirectorIdCard(directorCode: string, idCard: IdCard): Observable<IdCard> {
        const url = `${baseUrl}/${directorCode}/id-card`;
        return this._httpClient.post<Director>(url, idCard)
            .pipe(
                map(director => director.ids.find(id => {
                    return id.num === idCard.num
                        && id.doi === moment(idCard.doi.toString()).toISOString();
                })),
            );
    }

    updateDirectorIdCard(
        directorCode: string,
        idCardCode: string,
        idCard: IdCard
    ): Observable<IdCard> {
        const url = `${baseUrl}/${directorCode}/id-card/${idCardCode}`;
        return this._httpClient.patch<Director>(url, idCard)
            .pipe(
                map(director => director.ids.find(id => {
                    return id?.code === idCardCode
                })),
            );
    }

    deleteDirectorIdCard(directorCode: string, idCardCode: string): Observable<Director> {
        const url = `${baseUrl}/${directorCode}/id-card/${idCardCode}`;
        return this._httpClient.delete<Director>(url);
    }

    createDirectorIdCardDocument(
        directorCode: string,
        idCardCode: string,
        document: DocumentPayload
    ): Observable<Director> {
        const url = `${baseUrl}/${directorCode}/id-card/${idCardCode}/document`;
        return this._httpClient.post<Director>(url, document);
    }

    uploadDirectorIdCardDocuments(files: FileList): Observable<string> {
        return from(files).pipe(
            mergeMap(file => this._documentService.upload(file)),
        );
    }

    downloadDirectorIdCardDocumentUrls(idCard: IdCard): Observable<string[]> {
        return from(idCard.documents).pipe(
            mergeMap(document => this._documentService.get(document.code)),
            toArray(),
        );
    }

    sortedDirectorTerms(terms: DirectorTerm[]): DirectorTerm[] {
        return [ ...terms ].sort((a, b) => {
            return moment(a.from).diff(moment(b.from));
        });
    }

    createDirectorBankDetails(directorCode: string, accountDetail: AccountDetail): Observable<AccountDetail> {
        const url = `${baseUrl}/${directorCode}/bank-details`;
        return this._httpClient.post<Director>(url, accountDetail)
            .pipe(
                map(director => director.bank_details.find(bankDetail => {
                    return (bankDetail.iban === accountDetail.iban || bankDetail.account_no === accountDetail.account_no)
                })),
            );
    }

    updateDirectorBankDetails(
        directorCode: string,
        accountDetailCode: string,
        accountDetail: AccountDetail
    ): Observable<AccountDetail> {
        const url = `${baseUrl}/${directorCode}/bank-details/${accountDetailCode}`;
        return this._httpClient.patch<Director>(url, accountDetail)
            .pipe(
                map(director => director.bank_details.find(bankDetail => {
                    return bankDetail?.code === accountDetailCode
                })),
            );
    }

    deleteDirectorBankDetails(directorCode: string, accountDetailCode: string): Observable<Director> {
        const url = `${baseUrl}/${directorCode}/bank-details/${accountDetailCode}`;
        return this._httpClient.delete<Director>(url);
    }

    getDirectorTrails(id: string): Observable<Trail[]> {
        return this._httpClient.get<Trail[]>(`${baseUrl}/${id}/events`)
      }
    
      unArchiveDirector(code: string): Observable<Director> {
        const url = `${baseUrl}/${code}/unarchive`;
        return this._httpClient.patch<Director>(url, {is_deleted: false});
      }

      deleteIdCardDocument(directorCode: string, idCardCode: string, documentCode: string): Observable<Director> {
        const url = `${baseUrl}/${directorCode}/id-card/${idCardCode}/document/${documentCode}`;
        return this._httpClient.delete<Director>(url);
    }
    
    setRole(code: string, committeeCode: string, role: string): Observable<any> {
        const url = `${baseUrl}/${code}/assignment/set-role`;
        return this._httpClient.patch<any>(url, {committeeCode: committeeCode, role: role});
      }  
}
