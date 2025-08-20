import {
  OnChanges,
  Component,
  ElementRef,
  AfterViewInit,
  SimpleChanges,
  Input,
  HostListener,
} from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.scss"],
})
export class ChartComponent {
  @Input() public data!: { value: number; date: string }[];
  @Input() generalScale!: string;
  @Input() scale!: string;
  @Input() public id!: number;
  private margin = { x: 20, y: 20 };
  private width!: number;
  private height!: number;
  private x: any;
  private y: any;
  private svg: any;
  private tooltip: any;

  constructor(public chartElem: ElementRef) {}
  ngOnChanges(changes: SimpleChanges) {
    this.buildSvg();
  }
  private buildSvg() {
    this.svg?.remove();
    if (this.data.length === 0) return;
    const container = this.chartElem.nativeElement.firstChild;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.tooltip = d3
      .select("body")
      .append("div")
      .classed("chart-tooltip", true)
      .style("display", "none");

    this.svg = d3
      .select(this.chartElem.nativeElement.firstChild.firstChild)
      .append("g")
      .attr("transform", `translate(${0},${this.margin.y})`);
    this.addXandYAxis();
    this.drawLineAndPath();
  }

  private addXandYAxis() {
    this.x = d3.scaleTime().range([0, (this.width * 3) / 5]);
    this.y = d3
      .scaleLinear()
      .range([this.height - this.margin.y * 2, this.margin.y]);
    this.x.domain(d3.extent(this.data, (d) => new Date(d.date)));
    this.y.domain([0, d3.max(this.data, (d) => d.value)]);
  }

  private drawLineAndPath() {
    const area = d3
      .area()
      .y0(this.y(-50))
      .y1((d: any) => this.y(d.value));

    const line = d3
      .line()
      .x((d: any) => this.x(new Date(d.date)))
      .y((d: any) => this.y(d.value));

    const areaPath = this.svg
      .append("path")
      .datum(this.data)
      .attr("class", `${this.generalScale}-fill stroke-2 stroke-none`)
      .attr(
        "d",
        area
          .x((d: any) => this.x(new Date(d.date)))
          .y1((d: any) => this.y(d.value))
      );

    const linePath = this.svg
      .append("path")
      .datum(this.data)
      .attr("class", `${this.generalScale}-stroke stroke-2 fill-none`)
      .attr("d", line);

    const [lastPoint, beforeLastPoint] = [
      this.data[this.data.length - 1],
      this.data[this.data.length - 2],
    ];
    this.svg
      .append("text")
      .attr("x", this.x(new Date(lastPoint.date)) + 10)
      .attr("y", this.y(lastPoint.value) - 10)
      .text(lastPoint.value)
      .attr("text-anchor", "middle")
      .attr("class", `${this.generalScale}-darker-fill stroke-none`);
    beforeLastPoint &&
      this.svg
        .append("text")
        .attr("x", this.x(new Date(beforeLastPoint.date)))
        .attr("y", this.y(beforeLastPoint.value) - 10)
        .text(beforeLastPoint.value)
        .attr("text-anchor", "middle")
        .attr("class", `${this.generalScale}-darker-fill stroke-none`);
    this.svg
      .selectAll("dots")
      .data(this.data)
      .enter()
      .append("circle")
      .attr("class", `${this.generalScale}-darker-fill stroke-none`)
      .attr("cx", (d: any) => this.x(new Date(d.date)))
      .attr("cy", (d: any) => this.y(d.value))
      .attr("r", 4)
      .on("mouseover", () => {
        d3.select(".chart-tooltip");
      })
      .on("mouseout", () => {
        d3.select(".chart-tooltip");
      })
      .on("mousemove", (event, d) => {
        // const [x, y] = d3.pointer(event);
        // d3.select(".chart-tooltip")
        //   .attr("x", x)
        //   .attr("y", y - 10)
        //   .style("display", "block")
        //   .text(`${(d.value )}`);
      });

    const totalLength =
      linePath.node().getTotalLength() + areaPath.node().getTotalLength();

    linePath
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  }
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.buildSvg();
  }
}
