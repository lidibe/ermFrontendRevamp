import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { RiskAreaData } from "../../models/risk-area-data.model";
import { RiskAreaDataService } from "../../risk-data/risk-area-data/risk-area-data.service";
import { SummaryDataService } from "../../risk-data/summary-data/summary-data.service";
import { map } from "rxjs/operators";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  caption: "",
  lowerlimit: "0",
  bgColor: "#3B82F6",
  bgAlpha: "8",
  upperlimit: "100",
  showvalue: "1",
  numbersuffix: "%",
  theme: "fusion",
  showtooltip: "0",
};

const colorrange = {
  color: [
    {
      minvalue: "0",
      maxvalue: "50",
      code: "#F2726F",
    },
    {
      minvalue: "50",
      maxvalue: "75",
      code: "#FFC533",
    },
    {
      minvalue: "75",
      maxvalue: "100",
      code: "#62B58F",
    },
  ],
};

@Component({
  selector: "app-overall",
  templateUrl: "./overall.component.html",
  styleUrls: ["./overall.component.scss"],
  providers: [RiskAreaDataService],
  encapsulation: ViewEncapsulation.None,
})
export class OverallComponent implements OnInit {
  constructor(
    private riskAreaDataService: RiskAreaDataService,
    private summaryDataService: SummaryDataService
  ) {}
  componentId = "d0b1b9a7-4d9b-4ed5-badf-41005e948bc4";
  currentYear: number = 2021;
  // new Date().getFullYear();
  chartType: string = "bar-chart";
  chartName: string = "Bar Chart";
  month: string = "1";
  year: any = 2021;
  // new Date().getFullYear();
  monthLabel: string = "January";
  summary_value: number = 0;
  riskAreaData: RiskAreaData[] = [];
  data: any;
  summary: ChartData;

  type = "angulargauge";
  dataFormat = "json";

  years = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"];
  months = [
    { id: "1", label: "January" },
    { id: "2", label: "February" },
    { id: "3", label: "March" },
    { id: "4", label: "April" },
    { id: "5", label: "May" },
    { id: "6", label: "June" },
    { id: "7", label: "July" },
    { id: "8", label: "August" },
    { id: "9", label: "September" },
    { id: "10", label: "October" },
    { id: "11", label: "November" },
    { id: "12", label: "December" },
  ];
  displaySummary = false;
  displayOthers = false;
  overallComments: string;
  showOverallComments = false;

  descData = [
    {
      title: "bad",
      header: "0% - 50%",
      desc: "Overall risk profile for the month of December 2022 is Red, as the profile is Outside the Bank's risk appetite.",
    },
    {
      title: "neutral",
      header: "50% - 75%",
      desc: "Overall risk profile for the month of December 2022 is Amber indicating that the profile is within risk appetite but may determinate if not adequately managed. It requires management's attention in the short -to - medium term to improve the risk profile.",
    },
    {
      title: "good",
      header: "75% - 100%",
      desc: "Overall risk Profile for the month of december 2022, is green that the profile is within the Bank's risk appetite.",
    },
  ];

  availableColors = [
    { name: "Primary", color: "primary" },
    { name: "Accent", color: "accent" },
    { name: "Warn", color: "warn" },
  ];

  selected: {
    period?: any;
    month: any;
    year: any;
  };
  @ViewChild("parent") parent: ElementRef;
  riskData: any;

  ngOnInit(): void {
    this.renderData();
  }
  onSelectedChange(event, label): void {
    this.selected[label] = event;
  }
  setFilter(label: string, field: any): void {
    label === "month"
      ? (this.selected.month = field.value)
      : (this.selected.year = field.label);
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
  sortData(data: any): any {
    const currentDate = [
      this.year,
      // tslint:disable-next-line:radix
      parseInt(this.month) < 10 ? `0${this.month}` : this.month,
      "01",
    ].join("-");

    const reportInfo = data.reportInfo.map((r) => {
      let currentData = false;
      const link =
        "/erm/dashboards/" +
        r.name.toLowerCase().replace(" risk", "").replace(" and ", "-");
      const value = r.value
        .sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .map((v) => {
          v.date === currentDate && (currentData = true);

          return {
            ...v,
            value: parseFloat((v.value * 100).toFixed(2)),
          };
        });
      return { ...r, link, currentData, value };
    });
    const overall = data.overall
      .sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      .map((el, i) => {
        let currentData = false;
        const children = [];
        el.date === currentDate && (currentData = true);
        reportInfo?.map((r) => {
          children?.push({
            ...r,
            value: parseFloat(r?.value[i]?.value?.toFixed(2)),
          });
        });
        return {
          ...el,
          currentData,
          value: parseFloat((el?.value * 100)?.toFixed(2)),
          children,
        };
      });
    return { overall, reportInfo };
  }

  getSummaryData(): void {
    const query = {
      month: this.month,
      year: this.year,
    };
    this.summaryDataService
      .getSummaryDatasNew(query)
      .pipe(map((data: any) => this.sortData(data)))
      .subscribe((res: any) => {
        this.riskData = res;
      });
  }

  getSummaryComments(): void {
    const query = {
      month: this.month,
      year: this.year,
      page: 0,
      size: 100,
      limit: 100,
    };
    this.summaryDataService.getSummaryDatas(query).subscribe((res: any) => {
      console.log("RES -->", res);
      if (res.data && res.data[0]) {
        this.overallComments = res.data[0].comments;
        this.showOverallComments = true;
      } else {
        this.overallComments = null;
        this.showOverallComments = false;
      }
    });
  }

  renderData(): void {
    this.getSummaryData();
    this.getSummaryComments();
  }

  compute(item: RiskAreaData): number {
    return Number(item.qualitativeScore) + Number(item.quantitativeScore);
  }
  async print(): Promise<void> {
    // Add CSS rules for animation and border
    const style = document.createElement("style");
    document.head.appendChild(style);
    style.sheet?.insertRule(
      "body > div:last-child img { display: inline-block;width: 1240px;padding:50px; } "
    );

    // Capture page and generate PDF
    const canvas = await html2canvas(this.parent.nativeElement);
    const pdf = new jsPDF("p", "px", "a4");
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);

    const pdfRatio = pdfWidth / pdfHeight;
    const imgRatio = imgProps.width / imgProps.height;

    let newImgWidth;
    let newImgHeight;
    if (imgRatio > pdfRatio) {
      newImgWidth = pdfWidth;
      newImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    } else {
      newImgHeight = pdfHeight;
      newImgWidth = (imgProps.width * pdfHeight) / imgProps.height;
    }

    const y = (pdfHeight - newImgHeight) / 2;
    const x = (pdfWidth - newImgWidth) / 2;

    pdf.addImage(imgData, "PNG", x, y, newImgWidth, newImgHeight);
    pdf.save("summary.pdf");

    // Remove added CSS rules
    style.remove();
  }
}
