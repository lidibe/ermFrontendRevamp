import { Component, OnInit } from '@angular/core';
import {Kri} from '../../master-data/kri/kri.types';
import {KriService} from '../../master-data/kri/kri.service';

@Component({
  selector: 'app-operational',
  templateUrl: './operational.component.html',
  styleUrls: ['./operational.component.scss'],
  providers: [KriService]
})
export class OperationalComponent implements OnInit {

  componentId = '46df358d-6167-4a5f-8135-24691c7e8efb';

  title = 'Operational Risk';
  currentYear: number = new Date().getFullYear();
  chartType: string = 'bar-chart';
  chartName: string = 'Bar Chart';
  kris: Kri[] = [];
  constructor(
      private kriService: KriService,
  ) { }

  ngOnInit(): void {
    this.getKrisByRiskArea();
  }

  setCurrentYear(year: number): void {
    this.currentYear = year;
    this.renderData();
  }

  renderData(): void {
    this.getKrisByRiskArea();
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  setChart(type: string, name: string): void {
    this.chartType = type;
    this.chartName = name;
  }

  getKrisByRiskArea(): void {
    const query = { riskAreaId: this.componentId, page: 0, size: 20, limit: 20 };
    this.kriService.searchKris(query).subscribe((res: any) => {
      this.kris = res.data;
    });
  }

}
