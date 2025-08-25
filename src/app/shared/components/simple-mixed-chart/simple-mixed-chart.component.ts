import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';

import {
    ChartComponent,
    ApexAxisChartSeries,
    ApexChart,
    ApexFill,
    ApexYAxis,
    ApexTooltip,
    ApexTitleSubtitle,
    ApexXAxis
} from 'ng-apexcharts';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis | ApexYAxis[];
    title: ApexTitleSubtitle;
    labels: string[];
    stroke: any;
    dataLabels: any;
    fill: ApexFill;
    colors: string[];
    tooltip: ApexTooltip;
};

@Component({
    selector: 'app-simple-mixed-chart',
    templateUrl: './simple-mixed-chart.component.html',
    styleUrls: ['./simple-mixed-chart.component.scss']
})
export class SimpleMixedChartComponent implements OnInit, OnChanges {
    @ViewChild('chart') chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;
    @Input() details: { labelx: string, labely1: string, labely2: string, datay1: number[]; datay2: number[]; datax: any[] };

    constructor() {

    }

    ngOnInit(): void {
        this.displayGraph();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.displayGraph();
    }

    numFormatter(num: number): any {
        if (num > 999 && num < 1000000) {
            return (num / 1000).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million
        } else if (num > 1000000) {
            return (num / 1000000).toFixed(1) + 'M'; // convert to M for number from > 1 million
        } else if (num < 900) {
            return num; // if value < 1000, nothing to do
        }
    }

    displayGraph(): void {
        if (this.details) {
        this.chartOptions = {
            series: [
                {
                    name: this.details.labely1,
                    type: 'column',
                    data: this.details.datay1
                },
                {
                    name: this.details.labely2,
                    type: 'line',
                    data: this.details.datay2
                }
            ],
            chart: {
                height: 350,
                width: 650,
                type: 'line',
                toolbar: {
                    show: false
                },
            },
            colors: ['#00aa8c', '#ffcd00', '#00736e', '#00a5b9', '#e1004b', '#eb9b00'],
            stroke: {
                width: [0, 4]
            },
            title: {
                text: ''
            },
            dataLabels: {
                enabled: false,
                enabledOnSeries: [1]
            },
            labels: this.details.datax,
            xaxis: {},
            yaxis: [
                {
                    title: {
                        text: this.details.labely1
                    },
                    labels: {
                        formatter: (value) => {
                          // return '$ ' + this.numFormatter(value);
                          return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
                        }
                    },
                    floating: false,
                    decimalsInFloat: 2,
                    min: 0,
                },
                {
                    opposite: true,
                    title: {
                        text: this.details.labely2
                    },
                    labels: {
                        formatter: (value) => {
                            return (value * 100).toPrecision(2) + '%';
                        }
                    },
                    floating: false,
                    decimalsInFloat: 2,
                    min: 0,
                }
            ]
        };
    }
    }
}
