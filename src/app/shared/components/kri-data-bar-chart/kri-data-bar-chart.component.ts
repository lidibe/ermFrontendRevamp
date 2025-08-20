import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexFill,
  ApexGrid,
  ApexPlotOptions,
} from 'ng-apexcharts';
import { ErmService } from '../../services/erm.service';

export interface Goal {
  name: string;
  value: number;
  strokeWidth: number;
  strokeColor: string;
}

export interface Data {
  x: string;
  y: number;
  goals: Goal[];
}

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
  subtitle: ApexTitleSubtitle;
  colors: any;
  fill: ApexFill;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-kri-data-bar-chart',
  templateUrl: './kri-data-bar-chart.component.html',
  styleUrls: ['./kri-data-bar-chart.component.scss'],
  providers: [ErmService],
})
export class KriDataBarChartComponent implements OnInit, OnChanges {

  @Input() kriId: string;
  @Input() year: number;
  @Input() tl: string;
  targetLimit: string;
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  data: any[];
  graphData: Data[] = [];
  isLoading = true;
  constructor(
      private ermService: ErmService,
      private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.getData(this.kriId, this.year);
  }

  getData(id: string, year: number = 2021): void {
    this.ermService.getKriDataByKriId(id, year).subscribe((res: any) => {
      this.data = res;

      switch (this.tl) {
        case 'T':
          this.targetLimit = 'Target';
          break;
        case 'L':
          this.targetLimit = 'Limit';
          break;
        case 'R':
          this.targetLimit = 'Target range';
          break;
        default:
          this.targetLimit = 'Target';
          break;
      }

      this.isLoading = false;

      const data = this.data.sort((a, b) => {
        const dateA = new Date(`0${a.data_month}-01-${a.data_year}`);
        const dateB = new Date(`0${b.data_month}-01-${b.data_year}`);
        // @ts-ignore
        return dateA - dateB;
      });



      data.filter(item => {

        let value;
        let limit;
        let date;

        if (item.data_nature === 'P') {
          value = Number((item.data_value * 100).toPrecision(2));
        } else {
          value = Number(item.data_value);
        }

        if (item.data_nature === 'P') {
          limit = Number((item.data_rlimit * 100).toPrecision(2));
        } else {
          limit = Number(item.data_rlimit);
        }

        date = `${this.getMonth(item.data_month)}-${item.data_year}`;

        const gData = {} as Data;
        gData.x = date;
        gData.y = value;
        gData.goals = [
          {
            name: this.targetLimit,
            value: limit,
            strokeWidth: 5,
            strokeColor: '#ffcd00'
          }
        ];
        this.graphData.push(gData);
      });
      this.fillGraph(this.graphData);
      this.isLoading = false;
      this.cdRef.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
   if (changes.year) {
     console.log(this.year);
   }
  }

  fillGraph(data: Data[]): void {

    this.chartOptions = {
      series: [
        {
          name: 'Overall',
          data
        }
      ],
      chart: {
        height: 350,
        width: 650,
        type: 'bar',
        toolbar: {
          show: false
        },
      },
      grid: {
        show: false
      },
      colors: [
        '#00aa8c'
      ],
      dataLabels: {
        enabled: true,
        formatter: (value) => {
          // return '$ ' + this.numFormatter(value);
          return value.toLocaleString('en-US');
        }
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        customLegendItems: ['Actual', this.targetLimit],
        markers: {
          fillColors: ['#00aa8c', '#ffcd00']
        }
      },
      xaxis: {},
      yaxis: {
        floating: false,
        decimalsInFloat: 2,
        min: 0,
        labels: {
          formatter: (value) => {
            // return '$ ' + this.numFormatter(value);
            return value.toLocaleString('en-US');
          }
        },
      },
    };
  }

  getMonth(month: string): string {
    let ret;
    switch (month) {
      case '1':
        ret = 'Jan';
        break;
      case '2':
        ret = 'Feb';
        break;
      case '3':
        ret = 'Mar';
        break;
      case '4':
        ret = 'Apr';
        break;
      case '5':
        ret = 'May';
        break;
      case '6':
        ret = 'Jun';
        break;
      case '7':
        ret = 'Jul';
        break;
      case '8':
        ret = 'Aug';
        break;
      case '9':
        ret = 'Sep';
        break;
      case '10':
        ret = 'Oct';
        break;
      case '11':
        ret = 'Nov';
        break;
      case '12':
        ret = 'Dec';
        break;
    }

    return ret;
  }


}
