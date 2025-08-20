import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
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
import {RiskAreaDataService} from '../../../modules/erm/risk-data/risk-area-data/risk-area-data.service';


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
};

@Component({
  selector: 'app-bar-chart-with-markers',
  templateUrl: './bar-chart-with-markers.component.html',
  styleUrls: ['./bar-chart-with-markers.component.scss'],
  providers: [RiskAreaDataService],
})
export class BarChartWithMarkersComponent implements OnInit {

  @Input() id: string;
  @Input() year: number;
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  data: any[];
  graphData: Data[] = [];
  isLoading = true;
  query = {
    sort: 'created_at',
    order: 'asc',
    page: 0,
    year: '2021',
    size: 12,
    riskAreaId: '',
  };

  constructor(
      private service: RiskAreaDataService,
      private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.getData(this.id, this.year);
  }

  getData(id: string, year = 2021): void {
    this.query.riskAreaId = id;
    this.query.year = year.toString();
    console.log(' --> Query: ', this.query);
    this.service.getRiskAreaDatas(this.query)
        .subscribe((res: any) => {
          this.data = res.data;

          console.log('this.data', this?.data);

          this.isLoading = false;

          const data = this.data.sort((a, b) => {
            let _dateA;
            let _dateB;
            if (parseInt(a.month, 10) < 10) {
              _dateA = `${a.year}-0${a.month}-02T12:00:00+02:00`;
            } else {
              _dateA = `${a.year}-${a.month}-02T12:00:00+02:00`;
            }

            if (parseInt(b.month, 10) < 10) {
              _dateB = `${b.year}-0${b.month}-02T12:00:00+02:00`;
            } else {
              _dateB = `${b.year}-${b.month}-02T12:00:00+02:00`;
            }

            const dateA = new Date(_dateA);
            const dateB = new Date(_dateB);

            // @ts-ignore
            return dateA - dateB;
          });

          // console.log('data --------===========> ', data);

          data.filter(item => {
            const qualitative = Number(item.qualitativeScore);
            const quantitative = Number(item.quantitativeScore);
            const value = (Number(qualitative.toFixed(4)) + Number(quantitative.toFixed(4))) * 100;
            const _date = `${this.getMonth(item.month)}-${item.year}`;

            const gData = {} as Data;
            gData.x = _date;
            gData.y = value;
            gData.goals = [
              {
                name: 'Limit',
                value: 100,
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
        enabled: false
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        customLegendItems: ['Actual', 'Expected'],
        markers: {
          fillColors: ['#00aa8c', '#ffcd00']
        }
      },
      xaxis: {},
      yaxis: {
        floating: false,
        decimalsInFloat: 0,
        min: 0,
        max: 100
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
