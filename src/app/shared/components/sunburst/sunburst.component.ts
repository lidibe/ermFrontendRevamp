import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
} from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: "app-sunburst",
  templateUrl: "./sunburst.component.html",
  styleUrls: ["./sunburst.component.scss"],
})
export class SunburstComponent implements OnChanges {
  @Input() data: any = {};
  @Input() ratio?: number;
  @Input() generalScale!: string;
  private margin = { x: 20, y: 20 };
  private svg: any;
  private width!: number;
  private radius!: number;
  private lastData: any = {};

  constructor(public chartElem: ElementRef) {}

  ngOnChanges() {
    this.lastData = this.data[this.data?.length - 1];
    this.lastData.children = this.lastData.children.map((child) => {
      let color;
      if (child.value >= 75) color = "good";
      else if (child.value <= 50) color = "bad";
      else color = "neutral";
      return { ...child, color };
    });
    this.data?.length && this.treatData();
  }
  treatData() {
    setTimeout(() => {
      this.createChart();
    }, 400);
  }
  private createChart() {
    this.svg?.remove();
    const container = this.chartElem.nativeElement.firstChild;
    this.width = container.clientWidth;
    this.radius = (this.width - this.margin.y) / 2;

    const root = this.createHierarchy();
    const partitionLayout = this.createPartitionLayout();
    partitionLayout(root);

    const arc = this.createArc();

    this.createSvg();
    this.drawArcs(root, arc);
    const center = this.svg.append("g");
    // console.log({ root, arc });

    center
      .append("circle")
      .attr("r", this.radius - (this.margin.y * 2) / 3 - 4)
      .style("fill", "#fff")
      .style("stroke-width", ".25rem")
      .attr("class", `p-4  ${this.generalScale}-stroke`);

    center
      .append("text")
      .attr("text-anchor", "middle")
      .style("font-size", "1.5em")
      .style("font-weight", "bold")
      .attr(
        "class",
        `m-auto text-center h-full ${this.generalScale}-darker-fill`
      )
      .attr("x", 0)
      .attr("y", 8)
      .text(this.lastData.value + "%");
  }

  private createHierarchy() {
    return d3
      .hierarchy(this.lastData)
      .sum((d: any) => parseFloat(d.value))
      .each((d: any) => {
        if (d.value === 0) {
          d.children = null;
        }
      });
  }

  private createPartitionLayout() {
    return d3.partition().size([2 * Math.PI, this.radius]);
  }

  private createArc() {
    const numNodes = this.lastData.children.length;
    const anglePerNode = (Math.PI * 2) / numNodes;

    return d3
      .arc()
      .startAngle((d: any, i: number) => {
        return i * anglePerNode;
      })
      .endAngle((d: any, i: number) => {
        return (i + 1) * anglePerNode;
      })
      .innerRadius(this.radius - (this.margin.y * 2) / 3)
      .outerRadius(this.radius);
  }

  private createSvg() {
    this.svg = d3
      .select(this.chartElem.nativeElement.firstChild.firstChild)
      .append("g")
      .attr(
        "transform",
        `translate(${this.radius + this.margin.y / 2},${this.radius})`
      );
  }

  private drawArcs(root: any, arc: any) {
    this.svg
      .selectAll("path")
      .data(root.descendants())
      .enter()
      .append("path")
      .attr("d", arc)
      .style("stroke", "#fff")
      .attr("class", (d: any) => {
        // console.log(d, d.data.color);
        return d.data.color + "-darker-fill";
      })
      .on("mouseenter", (d: any) => {
        // Handle mouseenter event
        // console.log({ d });
      })
      .on("mouseleave", (d: any) => {
        // Handle mouseleave event
        // console.log("out", d);
      });
  }

  @HostListener("window:resize", ["$event"])
  onResize() {
    this.createChart();
  }
}
