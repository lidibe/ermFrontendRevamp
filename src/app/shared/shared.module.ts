import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
//import { FlexLayoutModule } from "@angular/flex-layout";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSortModule } from "@angular/material/sort";
import { DetailRowComponent } from "./components/detailrow/detailrow.component";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { NgApexchartsModule } from "ng-apexcharts";
import { MixedChartComponent } from "./components/mixed-chart/mixed-chart.component";
import { ContentLoaderModule } from "@ngneat/content-loader";
import { LinesChartComponent } from "./components/lines-chart/lines-chart.component";
import { BarChartComponent } from "./components/bar-chart/bar-chart.component";
import { OverallMixedChartComponent } from "./components/overall-mixed-chart/overall-mixed-chart.component";
import { SortPipe } from "./pipes/sort.pipe";
import { BarChartWithMarkersComponent } from "./components/bar-chart-with-markers/bar-chart-with-markers.component";
import { KriDataBarChartComponent } from "./components/kri-data-bar-chart/kri-data-bar-chart.component";
import { PieChartComponent } from "./components/pie-chart/pie-chart.component";
import { DataBarChartComponent } from "./components/data-bar-chart/data-bar-chart.component";
import { SimpleMixedChartComponent } from "./components/simple-mixed-chart/simple-mixed-chart.component";
import { GaugeChartComponent } from "./components/gauge-chart/gauge-chart.component";

import { FusionChartsModule } from "angular-fusioncharts";

import * as FusionCharts from "fusioncharts";
import * as charts from "fusioncharts/fusioncharts.charts";
import * as FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
import * as PowerCharts from "fusioncharts/fusioncharts.powercharts";
import * as TreeMap from "fusioncharts/fusioncharts.treemap";
import * as Widgets from "fusioncharts/fusioncharts.widgets.js";
import * as Gantt from "fusioncharts/fusioncharts.gantt.js";
import { HeaderComponent } from "../layout/common/header/header.component";
import { PageLayoutComponent } from "../layout/common/page-layout/page-layout.component";
import { DialogContainerComponent } from "../layout/common/dialog-container/dialog-container.component";
import { MatTableModule } from "@angular/material/table";
import { CardComponent } from "./components/card/card.component";
import { ChartComponent } from "./components/chart/chart.component";
import { RatioComponent } from "./components/ratio/ratio.component";
import { RiskDescriptionComponent } from "./components/risk-description/risk-description.component";
import { TitleComponent } from "./components/title/title.component";
import { GenralRiskCardComponent } from "./components/genral-risk-card/genral-risk-card.component";
import { SunburstComponent } from "./components/sunburst/sunburst.component";
import { ComplicatedSunComponent } from "./components/complicated-sun/complicated-sun.component";
import { GeneralRiskDescritionComponent } from "./components/general-risk-descrition/general-risk-descrition.component";
import { MatChipsModule } from "@angular/material/chips";
/* import { AngularSvgIconModule } from "angular-svg-icon"; */
import { RouterModule } from "@angular/router";

FusionChartsModule.fcRoot(
  FusionCharts,
  TreeMap,
  PowerCharts,
  Widgets,
  Gantt,
  charts,
  FusionTheme
);

@NgModule({
  declarations: [
    DetailRowComponent,
    MixedChartComponent,
    LinesChartComponent,
    LinesChartComponent,
    BarChartComponent,
    BarChartComponent,
    OverallMixedChartComponent,
    SortPipe,
    BarChartWithMarkersComponent,
    KriDataBarChartComponent,
    PieChartComponent,
    PieChartComponent,
    DataBarChartComponent,
    SimpleMixedChartComponent,
    SimpleMixedChartComponent,
    GaugeChartComponent,
    HeaderComponent,
    PageLayoutComponent,
   
    CardComponent,
    ChartComponent,
    RatioComponent,
    RiskDescriptionComponent,
    TitleComponent,
    GenralRiskCardComponent,
    SunburstComponent,
    ComplicatedSunComponent,
    GeneralRiskDescritionComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    //FlexLayoutModule,
    MatProgressBarModule,
    MatButtonModule,
    MatSortModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatInputModule,
    NgApexchartsModule,
    ContentLoaderModule,
    FusionChartsModule,
    MatChipsModule,
    //AngularSvgIconModule.forRoot(),
    RouterModule,
    DialogContainerComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    //FlexLayoutModule,
    MatProgressBarModule,
    MatSortModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    DetailRowComponent,
    MatCardModule,
    MatDialogModule,
    MatInputModule,
    MixedChartComponent,
    HeaderComponent,
    PageLayoutComponent,
    DialogContainerComponent,
    LinesChartComponent,
    BarChartComponent,
    OverallMixedChartComponent,
    SortPipe,
    BarChartWithMarkersComponent,
    KriDataBarChartComponent,
    PieChartComponent,
    DataBarChartComponent,
    SimpleMixedChartComponent,
    GaugeChartComponent,
    FusionChartsModule,
    CardComponent,
    ChartComponent,
    RatioComponent,
    RiskDescriptionComponent,
    TitleComponent,
    GenralRiskCardComponent,
    ComplicatedSunComponent,
    MatChipsModule,
  ],
})
export class SharedModule {}
