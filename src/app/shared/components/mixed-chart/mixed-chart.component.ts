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
} from 'ng-apexcharts';
import {ErmService} from '../../services/erm.service';

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
    colors: string[];
    fill: ApexFill;
    grid: ApexGrid;
};

@Component({
    selector: 'app-mixed-chart',
    templateUrl: './mixed-chart.component.html',
    styleUrls: ['./mixed-chart.component.scss'],
    providers: [ErmService],
})
export class MixedChartComponent implements OnInit, OnChanges {

    @Input() kriId: string;
    @Input() year: number;
    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;
    data: any[];
    isLoading = true;

    constructor(
        private ermService: ErmService,
        private cdRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.getData(this.kriId);
    }

    getData(id: string): void {
        this.ermService.getKriDataByKriId(id).subscribe((res: any) => {
            this.data = res;

            this.isLoading = false;
            const values: number[] = [];
            const limits: number[] = [];
            const dates = [];

            const data = this.data.sort((a, b) => {
                const dateA = new Date(`0${a.data_month}-01-${a.data_year}`);
                const dateB = new Date(`0${b.data_month}-01-${b.data_year}`);
                // @ts-ignore
                return dateA - dateB;
            });

            data.filter(item => {
                if (item.data_nature === 'P') {
                    values.push(Number((item.data_value * 100).toPrecision(2)));
                } else {
                    values.push(Number(item.data_value));
                }

                if (item.data_nature === 'P') {
                    limits.push(Number((item.data_rlimit * 100).toPrecision(2)));
                } else {
                    limits.push(Number(item.data_rlimit));
                }

                if (parseInt(item.data_month, 10) < 10) {
                    dates.push(`${item.data_year}-0${item.data_month}-01T12:00:00+02:00`);
                } else {
                    dates.push(`${item.data_year}-${item.data_month}-01T12:00:00+02:00`);
                }
            });

            this.fillGraph(values, limits, dates);
            this.isLoading = false;
            this.cdRef.detectChanges();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.year) {
            console.log(this.year);
        }
    }

    fillGraph(values: number[], limits: number[], dates: string[]): void {

        this.chartOptions = {
            series: [
                {
                    name: 'values',
                    type: 'area',
                    data: values
                },
                {
                    name: 'Limit',
                    type: 'line',
                    data: limits,
                }
            ],
            colors: ['#ffcd00', '#B32824'],
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
                opacity: 0.5,
                type: 'solid',
                colors: ['#8CD5FA', '#B32824'],
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
                    format: 'MMM yy',
                }
            },
            yaxis: {
                title: {
                    text: ''
                },
                floating: false,
                decimalsInFloat: 2,
            },
        };
    }
}
