import { Component, OnInit } from '@angular/core';
import {Kri} from '../../master-data/kri/kri.types';
import {KriService} from '../../master-data/kri/kri.service';

@Component({
  selector: 'app-liquidity',
  templateUrl: './liquidity.component.html',
  styleUrls: ['./liquidity.component.scss'],
  providers: [KriService]
})
export class LiquidityComponent implements OnInit {

  componentId = '667285a3-ab47-4507-99bf-94e8491301c3';
  title = 'Liquidity Risk';
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
