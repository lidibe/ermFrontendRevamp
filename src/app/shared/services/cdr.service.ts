import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class CdrService {
    constructor(private http: HttpClient) {
    }

    public getParams = (query: any) => {
        let params = new HttpParams();

        params = params
            .set('page', `${query.page + 1}`)
            .set('limit', `${query.per_page}`);

        if (query.id) {
            params = params.set('id', `${query.id}`);
        }

        if (query.name) {
            params = params.set('name', `${query.name}`);
        }

        if (query.key) {
            params = params.set('key', `${query.key}`);
        }

        if (query.status) {
            params = params.set('status', `${query.status}`);
        }

        if (query.source) {
            params = params.set('source', `${query.source}`);
        }

        if (query.matching_key) {
            params = params.set('matching_key', `${query.matching_key}`);
        }

        if (query.cl_code) {
            params = params.set('cl_code', `${query.cl_code}`);
        }

        if (query.ms_name) {
            params = params.set('ms_name', `${query.ms_name}`);
        }
        return params;
    }

    public getCriticalFieldsComparison = (query: any) => {
        const url = `/ms/api/v1/cdr/critical-fields-comparison`;

        const params = this.getParams(query);

        return this.http
            .get(url, { params });
    }

    public getCriticalFieldsComparisonById = (id: string) => {
        const url = `/ms/api/v1/cdr/critical-fields-comparison/${id}`;

        return this.http
            .get(url);
    }

    public getCriticalFieldsComparisonOccurrences = () => {
        const url = `/ms/api/v1/cdr/critical-fields-comparison/occurrences`;

        return this.http
            .get(url);
    }

    // /cdr/critical-fields-comparison/occurrences

    public getCdrPartyConjoin = (query: any) => {
        const url = `/ms/api/v1/cdr/party-conjoin`;

        const params = this.getParams(query);

        return this.http
            .get(url, { params });
    }

    getConjoinPartiesOccurrencesByStatus = () => {
        const url = `/ms/api/v1/cdr/party-conjoin/occurrences`;
        return this.http
            .get(url);
    }

    public setCdrPartyConjoinStatus = (id: string, status: string, reason: string) => {
        const url = `/ms/api/v1/cdr/party-conjoin/${id}/status`;
        return this.http
            .patch(url, { status, reason });
    }

    public getCdrPartyConjoinById = (id: string) => {
        const url = `/ms/api/v1/cdr/party-conjoin/${id}`;

        return this.http
            .get(url);
    }

    public getCdrMatchingParty = (query: any) => {
        const url = `/ms/api/v1/cdr/matching-set-party`;

        const params = this.getParams(query);

        return this.http
            .get(url, { params });
    }

    public getCdrMatchingPartyById = (id: string) => {
        const url = `/ms/api/v1/cdr/matching-set-party/${id}`;

        return this.http
            .get(url);
    }

    public getCdrMatchingPartyByCaseId = (id: string) => {
        const url = `/ms/api/v1/cdr/matching-set-party/by-case-id/${id}`;

        return this.http
            .get(url);
    }

    public getPartyOccurrences = () => {
        const url = `/ms/api/v1/cdr/party/occurrences`;
        return this.http
            .get(url);
    }

    public getPartyOccurrencesByClassificationCode = () => {
        const url = `/ms/api/v1/cdr/party/occurrences-by-clcode`;
        return this.http
            .get(url);
    }

    public getCdrParties = (query: any) => {
        const url = `/ms/api/v1/cdr/party`;

        const params = this.getParams(query);

        return this.http
            .get(url, { params });
    }

    public getCdrPartyById = (id: string) => {
        const url = `/ms/api/v1/cdr/party/${id}`;

        return this.http
            .get(url);
    }
}
