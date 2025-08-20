import {Component, OnInit} from '@angular/core';
import {KriService} from '../../master-data/kri/kri.service';
import {Kri} from '../../master-data/kri/kri.types';
import {ErmService} from '../../../../shared/services/erm.service';

@Component({
    selector: 'app-credit',
    templateUrl: './credit.component.html',
    styleUrls: ['./credit.component.scss'],
    providers: [KriService, ErmService],
})
export class CreditComponent implements OnInit {

    componentId = '64ac7328-f079-44a9-9d95-becb535e972c';
    title = 'Credit Risk';
    currentYear: number = new Date().getFullYear();
    chartType: string = 'bar-chart';
    chartName: string = 'Bar Chart';
    kris: Kri[] = [];
    topTwenty: any;
    topSectors: any;
    sum: number = 0.0;
    sumSectors: number = 0.0;
    sumNPL: number = 0.0;
    npl: { data: number[]; labels: string[] };
    stage: { data: number[]; labels: string[] };
    updo: { data: number[]; labels: any[] };
    country: { data: number[]; labels: any[] };
    ecl: { labelx: string, labely1: string, labely2: string, datay1: number[]; datay2: number[]; datax: any[] };

    constructor(
        private kriService: KriService,
        private ermService: ErmService,
    ) {
    }

    ngOnInit(): void {
        this.getKrisByRiskArea();
        this.getLoanAdvancesTopTwenty();
        this.getLoanAdvancesTopSectors();
        this.getLoanAdvancesNPL();
        this.getLoanAdvancesUpDo();
        this.getLoanAdvancesStage();
        this.getLoanAdvancesCountry();
        this.getLoanAdvancesEclRatio();
    }

    setCurrentYear(year: number): void {
        this.currentYear = year;
    }

    getCurrentYear(): number {
        return new Date().getFullYear();
    }

    setChart(type: string, name: string): void {
        this.chartType = type;
        this.chartName = name;
    }

    getKrisByRiskArea(): void {
        const query = {riskAreaId: this.componentId, page: 0, size: 20, limit: 20};
        this.kriService.searchKris(query).subscribe((res: any) => {
            this.kris = res.data;
        });
    }

    getLoanAdvancesTopTwenty(): void {
        this.ermService.getLoansTopTwenty().subscribe((res: any) => {
            this.topTwenty = res;
            this.topTwenty.filter(item => {
                this.sum += Number(item.facility_amount);
            });
        });
    }

    getLoanAdvancesTopSectors(): void {
        this.ermService.getLoansTopSectors().subscribe((res: any) => {
            this.topSectors = res;
            this.topSectors.filter(item => {
                this.sumSectors += Number(item.sum_value);
            });
        });
    }

    getLoanAdvancesNPL(): void {
        this.ermService.getLoansNPL().subscribe((res: any) => {
            const data = res;
            this.npl = {
                data: [],
                labels: []
            };
            data.filter(item => {
                this.npl.data.push(Number(item.sum_value));
                this.npl.labels.push(item.label);
            });
        });
    }

    getLoanAdvancesUpDo(): void {
        this.ermService.getLoansUpDo().subscribe((res: any) => {
            const data = res;
            this.updo = {
                data: [],
                labels: []
            };
            data.filter(item => {
                this.updo.data.push(Number(item.sum_value));
                this.updo.labels.push(item.label);
            });
        });
    }

    getLoanAdvancesStage(): void {
        this.ermService.getLoansStage().subscribe((res: any) => {
            const data = res;
            this.stage = {
                data: [],
                labels: []
            };
            data.filter(item => {
                this.stage.data.push(Number(item.sum_value));
                this.stage.labels.push(`Stage ${item.label}`);
            });
        });
    }

    getLoanAdvancesCountry(): void {
        this.ermService.getLoansCountry().subscribe((res: any) => {
            const data = res;
            this.country = {
                data: [],
                labels: []
            };
            data.filter(item => {
                this.country.data.push(Number(item.sum_value));
                this.country.labels.push(item.label);
            });
        });
    }

    getLoanAdvancesEclRatio(): void {
        this.ermService.getEclRatio().subscribe((res: any) => {
            const data = res;
            this.ecl = {
                datay1: [],
                datay2: [],
                datax: [],
                labelx: '',
                labely1: 'Exposure',
                labely2: 'Impairment'
            };
            let sumImpairment: number = 0;
            data.filter(item => {
                sumImpairment += Number(item.impairment);
            });
            data.filter(item => {
                this.ecl.datax.push(`Stage ${item.stage}`);
                this.ecl.datay1.push(Number(item.exposure));
                this.ecl.datay2.push(Number(item.impairment) / sumImpairment);
            });
            console.log(' ECL ', this.ecl);
        });
    }
}
