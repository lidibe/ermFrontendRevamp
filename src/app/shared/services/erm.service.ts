import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class ErmService {
    constructor(private http: HttpClient) {
    }

    public getParams = (query: any) => {
        let params = new HttpParams();

        params = params
            .set('page', `${query.page + 1}`)
            .set('limit', `${query.per_page}`);

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

        if (query.month) {
            params = params.set('month', `${query.month}`);
        }

        if (query.year) {
            params = params.set('year', `${query.year}`);
        }
        return params;
    }

    public getKriDataByKriId = (id: string, year: number = 2021) => {
        let url = `/ms/api/v1/erm/kri-data/kri/${id}`;
        if (year) {
            url = `${url}?year=${year}`;
        }
        return this.http
            .get(url);
    }

    public getLoansTopTwenty = () => {
        const url = `/ms/api/v1/erm/loans-advances/top-twenty`;

        const params = this.getParams({month: '3', year: '2021'});
        return this.http
            .get(url, {params});
    }

    public getLoansTopSectors = () => {
        const url = `/ms/api/v1/erm/loans-advances/top-sectors`;

        const params = this.getParams({month: '3', year: '2021'});
        return this.http
            .get(url, {params});
    }

    public getLoansNPL = () => {
        const url = `/ms/api/v1/erm/loans-advances/npl`;

        const params = this.getParams({month: '3', year: '2021'});
        return this.http
            .get(url, {params});
    }

    public getLoansUpDo = () => {
        const url = `/ms/api/v1/erm/loans-advances/updo`;

        const params = this.getParams({month: '3', year: '2021'});
        return this.http
            .get(url, {params});
    }

    public getLoansStage = () => {
        const url = `/ms/api/v1/erm/loans-advances/stage`;

        const params = this.getParams({month: '3', year: '2021'});
        return this.http
            .get(url, {params});
    }

    public getLoansCountry = () => {
        const url = `/ms/api/v1/erm/loans-advances/country`;

        const params = this.getParams({month: '3', year: '2021'});
        return this.http
            .get(url, {params});
    }

    public getEclRatio = () => {
        const url = `/ms/api/v1/erm/loans-advances/ecl-ratio`;

        const params = this.getParams({month: '3', year: '2021'});
        return this.http
            .get(url, {params});
    }
}
