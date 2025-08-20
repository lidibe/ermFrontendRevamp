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
  ApexTooltip,
  ApexMarkers,
  ApexGrid,
} from 'ng-apexcharts';
import { ErmService } from '../../services/erm.service';
import {KriData} from '../../../modules/erm/models/kri-data.model';

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
};

@Component({
  selector: 'app-lines-chart',
  templateUrl: './lines-chart.component.html',
  styleUrls: ['./lines-chart.component.scss'],
  providers: [ErmService],
})
export class LinesChartComponent implements OnInit {

  @Input() kriId: string;
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  data: KriData[];
  isLoading = true;
  constructor(
      private ermService: ErmService,
      private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.getData(this.kriId);
  }

  getData(id: string): void {
    this.ermService.getKriDataByKriId(id).subscribe((res: any) => {
      this.data = res;
      // console.log(this.data);
      this.isLoading = false;
      const values: number[] = [];
      const limits: number[] = [];
      const dates = [];

      this.data.filter(item => {
        if (item.nature === 'P') {
          values.push(item.value * 100);
        } else {
          values.push(item.value);
        }

        if (item.nature === 'P') {
          limits.push(item.rLimit * 100);
        } else {
          limits.push(item.rLimit);
        }

        // console.log('Values --> ', values);

        if (parseInt(item.month, 10) < 10) {
          // dates.push(`0${item.data_month}-01-${item.data_year}`);
          dates.push(`${item.year}-0${item.month}-01T12:00:00+02:00`);
        } else {
          // dates.push(`${item.data_month}-01-${item.data_year}`);
          dates.push(`${item.year}-${item.month}-01T12:00:00+02:00`);
        }
        /*if (parseInt(item.month, 10) < 10) {
          dates.push(`0${item.month}-01-${item.year}`);
        } else {
          dates.push(`${item.month}-01-${item.year}`);
        }*/
      });

      this.fillGraph(values, limits, dates);

      this.isLoading = false;
      this.cdRef.detectChanges();
    });
  }

  fillGraph(values: number[], limits: number[], dates: string[]): void {

    this.chartOptions = {
      series: [
        {
          name: 'Limit',
          data: limits
        },
        {
          name: 'Values',
          data: values
        }
      ],
      chart: {
        height: 350,
        width: 650,
        type: 'line',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      title: {
        text: '',
        align: 'left'
      },
      xaxis: {
        categories: dates,
        title: {
          text: 'Month'
        }
      },
      yaxis: {
        title: {
          text: ''
        },
        min: 6,
        max: 9
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5
      }
    };
  }


}
