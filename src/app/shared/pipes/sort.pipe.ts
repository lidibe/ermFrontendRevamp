import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sort',
    pure: false
})
export class SortPipe implements PipeTransform {

    transform(value: any[], criteria: SortCriteria): any[] {
        if (!value || !criteria) {
            return value;
        }

        const p: string = criteria.property;

        const sortFn: (a: any, b: any) => any = (a, b) => {
            let val: number = 0;
            if (a[p] === undefined) {
                val = -1;
            }
            else if (b[p] === undefined) {
                val = 1;
            }
            else {
                val = a[p] > b[p] ? 1 : (b[p] > a[p] ? -1 : 0);
            }
            return criteria.descending ? (val * -1) : val;
        };

        value.sort(sortFn);
        return value;
    }

}

export interface SortCriteria {
    property: string;
    descending?: boolean;
}
