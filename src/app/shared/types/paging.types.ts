import { OrderOptionsEnum } from './order.types';
export interface Page<T> {
    count: number;
    data: T[];
    limit: string;
    page: string;
}

export interface PageOptions {
    page: number;
    limit: number;
    sort_order?: string;
    sort_field?: string;
}

export interface PageState {
    page: number;
    pageSize: number;
    totalCount: number;
}
