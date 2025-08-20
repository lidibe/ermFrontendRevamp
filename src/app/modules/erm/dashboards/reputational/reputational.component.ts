import { Component, OnInit } from '@angular/core';
import {Kri} from '../../master-data/kri/kri.types';
import {KriService} from '../../master-data/kri/kri.service';

@Component({
  selector: 'app-reputational',
  templateUrl: './reputational.component.html',
  styleUrls: ['./reputational.component.scss'],
  providers: [KriService]
})
export class ReputationalComponent implements OnInit {

  componentId = '905d3df7-47b0-472a-bfed-1674c18f7920';
  title = 'Reputational Risk';
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
