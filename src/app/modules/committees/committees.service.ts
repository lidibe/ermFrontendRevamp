import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Page, PageOptions } from 'app/shared/types/paging.types';
import { SearchOptions } from 'app/shared/types/searching.types';
import { combineLatest, EMPTY, Observable, of } from 'rxjs';
import { catchError, expand, map, reduce, startWith, switchMap } from 'rxjs/operators';
import { BasicCommitteeDTO, Committee, Member } from './committees.types';
import {Director} from "../directors/directors.types";
import { OrderOptionsEnum } from 'app/shared/types/order.types';
import { MOCK_COMMITTEE } from 'app/mock-api/management/mock-committee-data';
import { Trail } from 'app/shared/types/trail.types';

const baseUrl = '/ms/api/v1/bose/committee';

function newCommittee(): Committee {
  return {
    name: '',
    label: '',
    description: '',
    full_description: '',
    members: [],
    reason_for_deletion: ''
  }
}

function mapByCode<T>(items: T[]): ({ [code: string]: T }) {
  return items.reduce((byCode: { [code: string]: T }, item: T) => {
    const code = item['code'];
    if (code) byCode[code] = item;
    return byCode;
  }, { });
}

function getRequestParams(options: [PageOptions, SearchOptions]): Record<string, string> {
  const [paging, searching] = options;
  const params = {
    page: paging.page.toString(),
    limit: paging.limit.toString(),
    sort_order: (paging.sort_order ?? OrderOptionsEnum.DESC).toString(),
  };
  if (searching && searching.search)
    params['search'] = searching.search;
  return params;
}

@Injectable({
  providedIn: 'root'
})
export class CommitteesService {
  constructor(
    private _httpClient: HttpClient
  ) { }

  getCommittees(
    paging: Observable<PageOptions>,
    searching?: Observable<SearchOptions>,
  ): Observable<Page<Committee>> {
    let search = searching;
    if (!searching) search = EMPTY;
    const page = paging.pipe(startWith({ page: 1, limit: 10, sort_order: OrderOptionsEnum.DESC }));
    search = search.pipe(startWith(null as SearchOptions));
    return combineLatest([page, search]).pipe(
      map(getRequestParams),
      switchMap(params => this._httpClient.get<Page<Committee>>(`${baseUrl}`, { params })),
    );
  }

  getCommitteeById(id: string): Observable<Committee> {
    if (id === 'new') return of(newCommittee());
    return this._httpClient.get<Committee>(`${baseUrl}/${id}`);
  }

  updateCommittee(committee: Committee): Observable<Committee> {
    return this._httpClient.patch<Committee>(`${baseUrl}/${committee.code}`, committee);
  }

  deleteCommitteeById(code: string, body: {[key: string]: string}): Observable<Committee> {
    return this._httpClient.delete<Committee>(`${baseUrl}/${code}`, { body });
  }

  deleteCommitteeMember(committeeCode: string, memberCode: string): Observable<any> {
    return this._httpClient.delete<any>(`${baseUrl}/${committeeCode}/member/${memberCode}`);
  }

  addCommitteeMember(committeeCode: string, member: Member): Observable<Member> {
    return this._httpClient.post<Member>(`${baseUrl}/${committeeCode}/member`, member);
  }

  createCommittee(form: Committee): Observable<any> {
    const newCommittee = { ...form }
    delete newCommittee._id;
    delete newCommittee.code;
    delete newCommittee.members;
    return this._httpClient.post<Committee>(`${baseUrl}`, newCommittee);
  }

  filterCommitteeMembers(committee: Committee, candidates: Director[]): Observable<Director[]> {
    if (!committee.members || !committee.members.length) return EMPTY;
    const committeeMembersByCode = mapByCode<Member>(committee.members);
    const filteredMembers = candidates.filter(member => committeeMembersByCode[member.code]);
    return of(filteredMembers);
  }

  getDirectorCommittees(directorCode: string): Observable<Committee[]> {
    let page = '1';
    let count = 0;
    const limit = '100';
    const params = { members: directorCode, page, limit };
    return this._httpClient.get<Page<Committee>>(baseUrl, { params })
      .pipe(
        expand(page => {
          count += page.data.length;
          if (count === page.count) return EMPTY;
          else {
            params.page = (parseInt(params.page) + 1).toString();
            return this._httpClient.get<Page<Committee>>(baseUrl, { params });
          }
        }),
        reduce((all, page) => all.concat(page.data), [ ]),
      );
  }

  getAllNonDeletedCommittees(): Observable<BasicCommitteeDTO[]> {
    return this._httpClient.get<BasicCommitteeDTO[]>(`${baseUrl}/non-deleted`).pipe(
        catchError(() => {
          return of(MOCK_COMMITTEE);
        }));
  }

  getCommitteeTrails(code: string): Observable<Trail[]> {
    return this._httpClient.get<Trail[]>(`${baseUrl}/${code}/events`)
  }

  unArchiveCommittee(code: string): Observable<Committee> {
    const url = `${baseUrl}/${code}/unarchive`;
    return this._httpClient.patch<Committee>(url, {is_deleted: false});
  }

  getCommitteesByOrgCode(orgCode: string): Observable<Committee[]> {
    return this._httpClient.get<Committee[]>(`${baseUrl}/org/${orgCode}`);
  }
}
