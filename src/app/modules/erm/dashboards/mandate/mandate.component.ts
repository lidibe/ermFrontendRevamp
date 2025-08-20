import { Component, OnInit } from '@angular/core';
import {Kri} from '../../master-data/kri/kri.types';
import {KriService} from '../../master-data/kri/kri.service';

@Component({
  selector: 'app-mandate',
  templateUrl: './mandate.component.html',
  styleUrls: ['./mandate.component.scss'],
  providers: [KriService]
})
export class MandateComponent implements OnInit {

  componentId = '03bc91dc-ddc2-471a-b14d-2fd2f542244d';
  title = 'Mandate Risk';
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
