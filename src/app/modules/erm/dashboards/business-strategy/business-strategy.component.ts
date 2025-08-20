import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {KriService} from '../../master-data/kri/kri.service';
import {Kri} from '../../master-data/kri/kri.types';

@Component({
    selector: 'app-business-strategy',
    templateUrl: './business-strategy.component.html',
    styleUrls: ['./business-strategy.component.scss'],
    providers: [KriService]
})
export class BusinessStrategyComponent implements OnInit {

    componentId = 'd0b1b9a7-4d9b-4ed5-badf-41005e948bc4';
    currentYear: number = new Date().getFullYear();
    chartType: string = 'bar-chart';
    chartName: string = 'Bar Chart';
    kris: Kri[] = [];

    constructor(
        private kriService: KriService,
        private cdRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.getKrisByRiskArea(this.componentId);
    }

    setCurrentYear(year: number): void {
        this.currentYear = year;
        this.renderData();
        this.cdRef.detectChanges();
    }

    renderData(): void {
        this.getKrisByRiskArea(this.componentId);
    }

    getCurrentYear(): number {
      return new Date().getFullYear();
    }

    setChart(type: string, name: string): void {
        this.chartType = type;
        this.chartName = name;
    }

    getKrisByRiskArea(id: string): void {
        const query = { riskAreaId: id, page: 0, size: 20, limit: 20 };
        this.kriService.searchKris(query).subscribe((res: any) => {
            this.kris = res.data;
            this.cdRef.detectChanges();
        });
    }
}
