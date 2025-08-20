import { Component, OnInit } from '@angular/core';
import {KriService} from '../../master-data/kri/kri.service';
import {Kri} from '../../master-data/kri/kri.types';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.scss']
})
export class ComplianceComponent implements OnInit {

  componentId = 'a29024eb-d5cc-438e-ab63-378279276f95';
  title = 'Compliance Risk';
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
