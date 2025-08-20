import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions, ApexGrid
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
};

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit, OnChanges {
  @ViewChild('chart') chart: ChartComponent;
  @Input() data: number[];
  @Input() labels: string[];
  @Input() width: number;

  public chartOptions: Partial<ChartOptions>;

  constructor(
      private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.fillGraph(this.data, this.labels);
  }

  fillGraph(data: number[], labels: string[]): void {
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
        width: 650,
        toolbar: {
          show: false
        },
      },
      colors : ['#00736e', '#4576b5'],
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
          }
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
          horizontal: true
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: labels
      }
    };

    // console.log(this.chartOptions);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    // console.log(this.data, this.labels);
    this.fillGraph(this.data, this.labels);
    this._cdRef.detectChanges();
  }
}
