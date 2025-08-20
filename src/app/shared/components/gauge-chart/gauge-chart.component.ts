import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';

import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexFill,
  ChartComponent, ApexStroke
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  fill: ApexFill;
  colors: string[];
};

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss']
})
export class GaugeChartComponent implements OnInit, OnChanges {
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  @Input() value: number;
  @Input() data: any;

  width = 600;
  height = 400;
  type = 'angulargauge';
  dataFormat = 'json';
  dataSource: any;

  constructor() {
  }

  ngOnInit(): void {
    // this.displayGraph();
    this.dataSource = this.data;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = this.data;
  }

  displayGraph(): void {
    this.chartOptions = {
      series: [this.value * 100],
      chart: {
        type: 'radialBar',
        offsetY: 0
      },
      colors: ['#c61205'],
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            // background: '#e7e7e7',
            strokeWidth: '97%',
            margin: 5,
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              opacity: 0.31,
              blur: 2
            }
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              formatter: (val) => {
                return parseInt(val.toString(), 10).toString() + ' %';
              },
              color: '#111',
              fontSize: '20px',
              show: true
            }
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          shadeIntensity: 0.5,
          inverseColors: true,
          gradientToColors: ['#f8ec06', '#2e9309'],
          opacityFrom: 1,
          opacityTo: 1,
          stops: [25, 75, 100],
        }
      },
      stroke: {
        lineCap: 'round'
      },
      labels: ['Percent']
    };
  }
}
