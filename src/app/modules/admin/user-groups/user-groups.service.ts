import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Group, GroupAndUsers, User } from './user-groups.types';

@Injectable({
  providedIn: 'root'
})
export class UserGroupsService {

  private prefix = '/ms/api/v1/auth/admin';

  constructor(private _httpClient: HttpClient) { }

  getGroups(): Observable<Array<Group>> {
    return this._httpClient.get<Array<Group>>(`${this.prefix}/groups`);
  }

  updateGroupAndUsers(group: Group, { name, users }): Observable<any> {
    const { members, code } = group;
    const memberCodeList = members.map(member => member.code);

    const deletedMembers = memberCodeList.filter(memberCode => !users.includes(memberCode));
    const addedMembers = users.filter(userCode => !memberCodeList.includes(userCode));


    const deletedObservables = deletedMembers.map(memberCode => this.deleteGroupUser(code, memberCode));
    const addedObservables = addedMembers.map(userCode => this.addGroupUser(code, userCode));

    if (group.name !== name) {
      return forkJoin([
        this.updateGroup(name, code),
        ...deletedObservables,
        ...addedObservables
      ]);
    }
    return forkJoin([...deletedObservables, ...addedObservables]);
  }

  updateGroup(name: string, code: string): Observable<Group> {
    return this._httpClient.patch<Group>(`${this.prefix}/group/${code}`, { name });
  }

  deleteGroupUser(groupCode: string, userCode: string): Observable<any> {
    return this._httpClient.delete<any>(`${this.prefix}/group/${groupCode}/member/${userCode}`);
  }

  addGroupUser(groupCode: string, userCode: string): Observable<any> {
    return this._httpClient
      .post<any>(`${this.prefix}/group/${groupCode}/member`, { user_code: userCode })
  }

  createGroupWithUsers({ name, users }: GroupAndUsers): Observable<any> {
    return this._httpClient
      .post<any>(`${this.prefix}/group`, { name })
      .pipe(
        take(1),
        switchMap(group => {

          return forkJoin(users.map(user_code =>
            this.addGroupUser(group.code, user_code)
          ))
        })
      )
  }

  getUsers(): Observable<Array<User>> {
    return this._httpClient.get<Array<User>>(`${this.prefix}/users`);
  }

  createUser(): Observable<Array<User>> {
    return this._httpClient.get<Array<User>>(`${this.prefix}/users`);
  }
}
