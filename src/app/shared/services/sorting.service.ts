import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PageOptions, PageState } from '../types/paging.types';
import { OrderOptionsEnum } from '../types/order.types';

@Injectable({
    providedIn: 'root',
})
export class SortingService {
    sortEntities(
        pageState: PageState,
        pagingSubject: BehaviorSubject<PageOptions>,
        sortOrder: string,
        sortKey?: string
    ): any {
        if (!sortKey) sortOrder = sortOrder === OrderOptionsEnum.ASC ? OrderOptionsEnum.DESC : OrderOptionsEnum.ASC;
        pagingSubject.next({
            page: pageState.page,
            limit: pageState.pageSize,
            sort_order: sortOrder,
            sort_field: sortKey,
        });
        return sortOrder;
    }
}
