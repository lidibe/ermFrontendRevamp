import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Page, PageOptions } from 'app/shared/types/paging.types';
import { SearchOptions } from 'app/shared/types/searching.types';
import { combineLatest, EMPTY, from, Observable, of } from 'rxjs';
import { map, mergeMap, startWith, switchMap } from 'rxjs/operators';
import { Member } from '../committees/committees.types';
import { Agenda, Decision, Meeting, MeetingTypeEnum } from './meetings.types';
import { DocumentService } from '../../shared/services/document.service';
import { OrderOptionsEnum } from 'app/shared/types/order.types';
import { DocumentPayload } from 'app/shared/types/file.types';
import { Trail } from 'app/shared/types/trail.types';

const baseUrl = '/ms/api/v1/bose/meeting';

function newMeeting(): Meeting {
    return {
        name: '',
        title: '',
        description: '',
        full_description: '',
        starting_at: '',
        ending_at: '',
        reason_for_deletion: '',
        type: '',
    };
}

function getRequestParams(
    options: [PageOptions, SearchOptions]
): Record<string, string> {
    const [paging, searching] = options;
    console.log(options);

    const params = {
        page: paging.page.toString(),
        limit: paging.limit.toString(),
        sort_order: (paging.sort_order ?? OrderOptionsEnum.DESC).toString(),
        sort_field: paging?.sort_field?.toString(),
        ...Object.entries(searching || {})
            .filter(
                ([_, value]) =>
                    value !== undefined && value !== null && value !== ''
            )
            .reduce((acc, [key, value]) => {
                acc[key] = value.toString();
                return acc;
            }, {}),
    };

    return params;
}

@Injectable({
    providedIn: 'root',
})
export class MeetingsService {
    constructor(
        private _documentService: DocumentService,
        private _httpClient: HttpClient
    ) {}

    getMeetings(
        paging: Observable<PageOptions>,
        searching?: Observable<SearchOptions>
    ): Observable<Page<Meeting>> {
        let search = searching;
        if (!searching) search = EMPTY;
        const page = paging.pipe(
            startWith({ page: 1, limit: 10, sort_order: OrderOptionsEnum.DESC })
        );
        search = search.pipe(startWith(null as SearchOptions));
        return combineLatest([page, search]).pipe(
            map(getRequestParams),
            switchMap((params) =>
                this._httpClient.get<Page<Meeting>>(`${baseUrl}`, { params })
            )
        );
    }

    getMeetingById(id: string): Observable<Meeting> {
        if (id === 'new') return of(newMeeting());
        return this._httpClient.get<Meeting>(`${baseUrl}/${id}`);
    }

    createMeeting(meeting: Meeting): Observable<Meeting> {
        return this._httpClient.post<Meeting>(baseUrl, meeting);
    }

    updateMeeting(id: string, meeting: Meeting): Observable<Meeting> {
        return this._httpClient.patch<Meeting>(`${baseUrl}/${id}`, meeting);
    }

    deleteMeeting(
        code: string,
        body: { [key: string]: string }
    ): Observable<Meeting> {
        return this._httpClient.delete<Meeting>(`${baseUrl}/${code}`, { body });
    }

    createMember(meetingCode: string, member: Member): Observable<Member> {
        return this._httpClient.post<Member>(
            `${baseUrl}/${meetingCode}/member`,
            member
        );
    }

    deleteMember(meetingCode: string, memberCode: string): Observable<Member> {
        return this._httpClient.delete<Member>(
            `${baseUrl}/${meetingCode}/member/${memberCode}`
        );
    }

    createAgendaItem(
        meetingCode: string,
        agendaItem: Agenda
    ): Observable<Agenda> {
        return this._httpClient
            .post<Meeting>(`${baseUrl}/${meetingCode}/agenda-item`, agendaItem)
            .pipe(
                map((meeting) =>
                    meeting.agenda.find((agenda) => {
                        return agenda.title === agendaItem.title;
                    })
                )
            );
    }

    editAgendaItem(
        meetingCode: string,
        agendaItemCode: string,
        agendaItem: Agenda
    ): Observable<Agenda> {
        const url = `${baseUrl}/${meetingCode}/agenda-item/${agendaItemCode}`;
        return this._httpClient.patch<Meeting>(url, agendaItem).pipe(
            map((meeting) =>
                meeting.agenda.find((agenda) => {
                    return agenda.code === agendaItemCode;
                })
            )
        );
    }

    deleteAgendaItem(
        meetingCode: string,
        agendaItemCode: string
    ): Observable<Agenda> {
        const url = `${baseUrl}/${meetingCode}/agenda-item/${agendaItemCode}`;
        return this._httpClient.delete<Agenda>(url);
    }

    deactivateAgendaItem(
        meetingCode: string,
        agendaItemCode: string
    ): Observable<Agenda> {
        const url = `${baseUrl}/${meetingCode}/agenda-item/${agendaItemCode}/deactivate`;
        return this._httpClient.patch<Agenda>(url, { is_activated: false });
    }

    createDecision(
        meetingCode: string,
        decision: Decision
    ): Observable<Agenda> {
        const url = `${baseUrl}/${meetingCode}/decision`;
        return this._httpClient
            .post<Meeting>(url, decision)
            .pipe(map((meeting) => meeting.agenda[meeting.agenda.length - 1]));
    }

    createAgendItemDecision(
        meetingCode: string,
        agendaItemCode: string,
        decision: Decision
    ): Observable<Decision> {
        const url = `${baseUrl}/${meetingCode}/agenda-item/${agendaItemCode}/decision`;
        return this._httpClient.post<Meeting>(url, decision).pipe(
            map((meeting) =>
                meeting.agenda.find((item) => {
                    return item.code === agendaItemCode;
                })
            ),
            map((agenda) => agenda?.decision)
        );
    }

    updateAgendItemDecision(
        meetingCode: string,
        agendaItemCode: string,
        decisionCode: string,
        decision: Decision
    ): Observable<Decision> {
        decision.code = decisionCode;
        const url = `${baseUrl}/${meetingCode}/agenda-item/${agendaItemCode}/decision`;
        return this._httpClient.patch<Meeting>(url, decision).pipe(
            map((meeting) =>
                meeting.agenda.find((item) => {
                    return item.code === agendaItemCode;
                })
            ),
            map((agenda) => agenda?.decision)
        );
    }

    deleteAgendaItemDecision(
        meetingCode: string,
        agendaItemCode: string
    ): Observable<Agenda> {
        const url = `${baseUrl}/${meetingCode}/agenda-item/${agendaItemCode}/decision`;
        return this._httpClient.delete<Meeting>(url).pipe(
            map((meeting) =>
                meeting.agenda.find((item) => {
                    return item.code === agendaItemCode;
                })
            )
        );
    }

    uploadDocuments(files: FileList): Observable<string> {
        return from(files).pipe(
            mergeMap((file) => this._documentService.upload(file))
        );
    }

    createAgendaItemDocument(
        meetingCode: string,
        agendaItemCode: string,
        documentCode: string
    ): Observable<Meeting> {
        const url = `${baseUrl}/${meetingCode}/agenda-item/${agendaItemCode}/document`;
        return this._httpClient.post<Meeting>(url, {
            document_code: documentCode,
        });
    }

    downloadAgendaItemDecisionDocumentUrls(
        agendaItem: Agenda
    ): Observable<string> {
        if (!agendaItem?.decision?.documents?.length) return EMPTY;
        return from(agendaItem.decision.documents).pipe(
            mergeMap((document) => this._documentService.get(document.code))
        );
    }

    getMeetingTypeKeys() {
        return Object.keys(MeetingTypeEnum);
    }

    createMeetingDocument(
        meetingCode: string,
        documentPayload: DocumentPayload
    ): Observable<Meeting> {
        const url = `${baseUrl}/${meetingCode}/document`;
        return this._httpClient.post<Meeting>(url, documentPayload);
    }

    getMeetingTrails(code: string): Observable<Trail[]> {
        return this._httpClient.get<Trail[]>(`${baseUrl}/${code}/events`);
    }

    unArchiveMeeting(code: string): Observable<Meeting> {
        const url = `${baseUrl}/${code}/unarchive`;
        return this._httpClient.patch<Meeting>(url, { is_deleted: false });
    }

    deleteMeetingDocument(
        meetingCode: string,
        documentCode: string
    ): Observable<Meeting> {
        const url = `${baseUrl}/${meetingCode}/document/${documentCode}`;
        return this._httpClient.delete<Meeting>(url);
    }
}
