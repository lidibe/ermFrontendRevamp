import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions, ApexGrid, ApexTooltip, ApexYAxis
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  colors: string[];
};

@Component({
  selector: 'app-data-bar-chart',
  templateUrl: './data-bar-chart.component.html',
  styleUrls: ['./data-bar-chart.component.scss'],
})
export class DataBarChartComponent implements OnInit, OnChanges {
  @ViewChild('chart') chart: ChartComponent;
  @Input() width: number;
  @Input() details: { data: number[]; labels: string[] };

  public chartOptions: Partial<ChartOptions>;

  constructor(
      private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.fillGraph(this.details?.data, this.details?.labels);
  }

  fillGraph(data: number[], labels: string[]): void {
    if (this.details) {
    this.chartOptions = {
      series: [
        {
          name: 'basic',
          data: data
        }
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        },
      },
      colors : ['#00aa8c', '#4576b5'],
      grid: {
        show: false,
        borderColor: '#90A4AE',
        strokeDashArray: 0,
        position: 'back',
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: false
          },
        },
        row: {
          colors: undefined,
          opacity: 0.5
        },
        column: {
          colors: undefined,
          opacity: 0.5
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
      },
      plotOptions: {
        bar: {
          horizontal: false
        }
      },
      dataLabels: {
        enabled: false
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
          }
        },
      },
      xaxis: {
        categories: labels
      }
    };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.fillGraph(this.details?.data, this.details?.labels);
    this._cdRef.detectChanges();
  }
}
