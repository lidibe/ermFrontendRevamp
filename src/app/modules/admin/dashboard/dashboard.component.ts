import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CdrService} from '../../../shared/services/cdr.service';

@Component({
    selector       : 'dashboard',
    templateUrl    : './dashboard.component.html',
    styleUrls      : ['./dashboard.component.scss'],
    providers      : [CdrService],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit
{
    /**
     * Constructor
     */
    cfcoData: number[] = [];
    cfcoLabels: string[] = [];

    ptyData: number[] = [];
    ptyLabels: string[] = [];

    ptyCCodeData: number[] = [];
    ptyCCodeLabels: string[] = [];

    ptyCjData: number[] = [];
    ptyCjLabels: string[] = [];

    constructor(
        private cdrService: CdrService,
    )
    {
    }

    ngOnInit(): void {
        this.getCriticalFieldsComparisonOccurrences();
        this.getPartyOccurrences();
        this.getPartyOccurrencesByClassificationCode();
        this.getConjoinPartiesOccurrencesByStatus();
    }

    getCriticalFieldsComparisonOccurrences(): void {
        this.cdrService.getCriticalFieldsComparisonOccurrences().subscribe((res: any) => {
            const result = res;
            result.filter(item => {
               this.cfcoData.push(item.nb);
               this.cfcoLabels.push(item.field_name);
            });
        });
    }

    getPartyOccurrences(): void {
        this.cdrService.getPartyOccurrences().subscribe((res: any) => {
            const result = res;
            result.filter(item => {
                this.ptyData.push(item.nb);
                this.ptyLabels.push(item.source_system_name);
            });
        });
    }

    getPartyOccurrencesByClassificationCode(): void {
        this.cdrService.getPartyOccurrencesByClassificationCode().subscribe((res: any) => {
            const result = res;
            result.filter(item => {
                this.ptyCCodeData.push(item.nb);
                this.ptyCCodeLabels.push(item.classification_code);
            });
        });
    }

    getConjoinPartiesOccurrencesByStatus(): void {
        this.cdrService.getConjoinPartiesOccurrencesByStatus().subscribe((res: any) => {
            const result = res;
            result.filter(item => {
                this.ptyCjData.push(item.nb);
                this.ptyCjLabels.push(item.cdr_status);
            });
        });
    }



}
