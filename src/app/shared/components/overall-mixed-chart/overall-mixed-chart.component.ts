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
} from 'ng-apexcharts';
import {RiskAreaDataService} from '../../../modules/erm/risk-data/risk-area-data/risk-area-data.service';

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
  selector: 'app-overall-mixed-chart',
  templateUrl: './overall-mixed-chart.component.html',
  styleUrls: ['./overall-mixed-chart.component.scss'],
  providers: [RiskAreaDataService],
})
export class OverallMixedChartComponent implements OnInit {

  @Input() id: string;
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  data: any[];
  isLoading = true;
  query = {
    sort: 'created_at',
    order: 'asc',
    page: 0,
    size: 12,
    year: '2020',
    per_page: 10,
    riskAreaId: '',
  };
  constructor(
      private service: RiskAreaDataService,
      private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.getData(this.id);
  }



  getData(id: string): void {
    this.query.riskAreaId = id;
    this.service.getRiskAreaDatas(this.query)
        .subscribe((res: any) => {
      this.data = res.data;

      this.isLoading = false;
      const values: number[] = [];
      const dates = [];

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

      console.log('data', data);

      data.filter(item => {
        const qualitative = Number(item.qualitativeScore);
        const quantitative = Number(item.quantitativeScore);
        values.push((Number(qualitative.toFixed(4)) + Number(quantitative.toFixed(4))) * 100);

        if (parseInt(item.month, 10) < 10) {
          // dates.push(`0${item.data_month}-01-${item.data_year}`);
          dates.push(`${item.year}-0${item.month}-02T12:00:00+02:00`);
        } else {
          // dates.push(`${item.data_month}-01-${item.data_year}`);
          dates.push(`${item.year}-${item.month}-02T12:00:00+02:00`);
        }
        /* if (parseInt(item.month, 10) < 10) {
          dates.push(`0${item.month}-01-${item.year}`);
        } else {
          dates.push(`${item.month}-01-${item.year}`);
        }*/
      });

      console.log('+++++++++++++++++++++++++++++++++', values, dates);

      this.fillGraph(values, dates);

      this.isLoading = false;
      this.cdRef.detectChanges();
    });
  }

  fillGraph(values: number[], dates: string[]): void {

    this.chartOptions = {
      series: [
        {
          name: 'values',
          type: 'area',
          data: values
        },
        {
          name: '',
          type: 'area',
          data: []
        },
      ],
      colors : ['#4d3a96', '#4576b5'],
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
      fill: {
        opacity: .4,
        type: 'solid',
        colors: ['#D1F2EB', '#B32824'],
        gradient: {
          shade: 'dark',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 0,
          opacityTo: 1,
          stops: [0, 50, 100],
        },
        image: {
          src: [],
          width: undefined,
          height: undefined
        },
        pattern: {
          style: 'verticalLines',
          width: 6,
          height: 6,
          strokeWidth: 2,
        },
      },
      chart: {
        height: 350,
        width: 650,
        type: 'line',
        toolbar: {
          show: false
        },
      },
      stroke: {
        width: [2, 4],
        curve: 'smooth'
      },
      title: {
        text: ''
      },
      dataLabels: {
        enabled: false,
        enabledOnSeries: [1]
      },
      labels: dates,
      xaxis: {
        type: 'datetime',
        labels: {
          format: 'MMM yyyy',
        }
      },
      yaxis: {
        title: {
          text: ''
        },
        floating: false,
        decimalsInFloat: 2,
        min: 0,
        max: 100
      },

    };
  }


}
