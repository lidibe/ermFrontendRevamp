import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RiskAreaData } from '../../models/risk-area-data.model';
import { RiskAreaDataService } from '../../risk-data/risk-area-data/risk-area-data.service';
import { SummaryDataService } from '../../risk-data/summary-data/summary-data.service';

export interface Chart {
  caption: string;
  lowerlimit: string;
  upperlimit: string;
  bgColor: string;
  bgAlpha: string;
  showvalue: string;
  numbersuffix: string;
  theme: string;
  showtooltip: string;
}

export interface Color {
  minvalue: string;
  maxvalue: string;
  code: string;
}

export interface ChartData {
  chart: Chart;
  colorrange: {
    color: Color[];
  };
  dials?: {
    dial: { value: string }[];
  };
}

const chart: Chart = {
  caption: '',
  lowerlimit: '0',
  bgColor: '#3B82F6',
  bgAlpha: '8',
  upperlimit: '100',
  showvalue: '1',
  numbersuffix: '%',
  theme: 'fusion',
  showtooltip: '0',
};

const colorrange = {
  color: [
    {
      minvalue: '0',
      maxvalue: '50',
      code: '#F2726F',
    },
    {
      minvalue: '50',
      maxvalue: '75',
      code: '#FFC533',
    },
    {
      minvalue: '75',
      maxvalue: '100',
      code: '#62B58F',
    },
  ],
};

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [RiskAreaDataService],
  encapsulation: ViewEncapsulation.None,
})
export class SummaryComponent implements OnInit {
  componentId = 'd0b1b9a7-4d9b-4ed5-badf-41005e948bc4';
  currentYear: number = new Date().getFullYear();
  chartType: string = 'bar-chart';
  chartName: string = 'Bar Chart';
  month: string = '1';
  year: any = new Date().getFullYear();
  monthLabel: string = 'January';
  summary_value: number = 0;
  riskAreaData: RiskAreaData[] = [];
  data: RiskAreaData[] = [];
  summary: ChartData;

  width = '100%';
  height = 280;
  overallWidth = '100%';
  overallHeight = 450;
  type = 'angulargauge';
  dataFormat = 'json';

  years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  months = [
    { id: '1', label: 'January' },
    { id: '2', label: 'February' },
    { id: '3', label: 'March' },
    { id: '4', label: 'April' },
    { id: '5', label: 'May' },
    { id: '6', label: 'June' },
    { id: '7', label: 'July' },
    { id: '8', label: 'August' },
    { id: '9', label: 'September' },
    { id: '10', label: 'October' },
    { id: '11', label: 'November' },
    { id: '12', label: 'December' },
  ];
  displaySummary = false;
  displayOthers = false;
  overallComments: string;
  showOverallComments = false;

  constructor(
    private riskAreaDataService: RiskAreaDataService,
    private summaryDataService: SummaryDataService
  ) {}

  ngOnInit(): void {
    this.renderData();
  }

  setCurrentYear(year: number): void {
    this.currentYear = year;
    this.renderData();
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  setChart(type: string, name: string): void {
    this.chartType = type;
    this.chartName = name;
  }

  setMonth(month: string, monthLabel): void {
    this.month = month;
    this.monthLabel = monthLabel;
    this.renderData();
  }

  setYear(year: string): void {
    this.year = year;
    this.renderData();
  }

  getSummaryData(): void {
    const query = {
      month: this.month,
      year: this.year,
      page: 0,
      size: 100,
      limit: 100,
    };
    this.summaryDataService.getSummaryDatas(query).subscribe((res: any) => {
      if (res.data && res.data[0]) {
        this.overallComments = res.data[0].comments;
        this.showOverallComments = true;
      } else {
        this.overallComments = null;
        this.showOverallComments = false;
      }
    });
  }
  getRiskArea(): void {
    const query = {
      month: this.month,
      year: this.year,
      page: 0,
      size: 100,
      limit: 100,
    };
    this.riskAreaDataService.getRiskAreaDatas(query).subscribe((res: any) => {
      this.summary_value = 0;
      this.data = [];
      this.riskAreaData = res.data;
      this.riskAreaData.filter((item) => {
        console.log('item', item);
        this.summary_value +=
          (Number(item.quantitativeScore) + Number(item.qualitativeScore)) *
          item.weight;
        const details = item;
        details.quantitativeScore = Number(item.quantitativeScore);
        details.qualitativeScore = Number(item.qualitativeScore);
        const value = details.quantitativeScore + details.qualitativeScore;

        details.data = {} as ChartData;
        details.data.chart = chart;
        details.data.colorrange = colorrange;
        details.data.dials = { dial: [{ value: `${value * 100}` }] };

        this.data.push(details);
      });
      this.summary = {} as ChartData;
      this.summary.chart = chart;
      this.summary.colorrange = colorrange;
      this.summary.dials = { dial: [{ value: `${this.summary_value * 100}` }] };

      this.displaySummary = true;
      this.displayOthers = true;
    });
  }

  renderData(): void {
    this.getSummaryData();
    this.getRiskArea();
  }

  compute(item: RiskAreaData): number {
    return Number(item.qualitativeScore) + Number(item.quantitativeScore);
  }
}
