import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ApexTooltip, ChartComponent} from 'ng-apexcharts';

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  tooltip: ApexTooltip;
  colors: string[];
  labels: any;
};

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit, OnChanges {
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  @Input() details: { data: number[]; labels: string[] };

  constructor(
      private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    if (this.details) {
    this.chartOptions = {
      series: this.details?.data,
      chart: {
        width: 450,
        type: 'pie',
      },
      colors: ['#00aa8c', '#ffcd00', '#00736e', '#00a5b9', '#e1004b', '#eb9b00'],
      labels: this.details?.labels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 400
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };
    this._cdRef.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if  (this.details) {
    this.chartOptions = {
      series: this.details?.data,
      chart: {
        width: 450,
        type: 'pie',
      },
      colors: ['#00aa8c', '#ffcd00', '#00736e', '#00a5b9', '#e1004b', '#eb9b00'],
      labels: this.details?.labels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 400
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };
    this._cdRef.detectChanges();
  }
  }
}
