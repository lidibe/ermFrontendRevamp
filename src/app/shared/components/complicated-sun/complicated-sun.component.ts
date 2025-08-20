import { Component, ElementRef, OnInit } from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: "app-complicated-sun",
  templateUrl: "./complicated-sun.component.html",
  styleUrls: ["./complicated-sun.component.scss"],
})
export class ComplicatedSunComponent implements OnInit {
  constructor(public chartElem: ElementRef) {}
  json = {
    name: "ref",
    children: [
      {
        name: "june11",
        children: [
          {
            name: "atts",
            children: [
              { name: "early", size: 11 },
              { name: "jcp", size: 40 },
              { name: "jcpaft", size: 50 },
              { name: "stillon", size: 195 },
              {
                name: "jo",

                children: [
                  { name: "early", size: 100 },
                  { name: "jcp", size: 67 },
                  { name: "jcpaft", size: 110 },
                  { name: "stillon", size: 154 },

                  {
                    name: "sus1",
                    children: [
                      { name: "early", size: 11 },
                      { name: "jcp", size: 118 },
                      { name: "jcpaft", size: 39 },
                      { name: "stillon", size: 2779 },
                    ],
                  },

                  {
                    name: "sus5",
                    children: [
                      { name: "early", size: 0 },
                      { name: "jcp", size: 64 },
                      { name: "jcpaft", size: 410 },
                      { name: "stillon", size: 82 },
                    ],
                  },

                  {
                    name: "sus9",
                    children: [
                      { name: "early", size: 1018 },
                      { name: "jcp", size: 3458 },
                      { name: "jcpaft", size: 106 },
                      { name: "stillon", size: 243 },
                    ],
                  },

                  {
                    name: "sus13",
                    children: [
                      { name: "early", size: 110 },
                      { name: "jcp", size: 190 },
                      { name: "jcpaft", size: 80 },
                      { name: "stillon", size: 9190 },
                      { name: "allsus", size: 3970 },
                    ],
                  },
                ],
              },
            ],
          },

          { name: "noatt", size: 30 },
        ],
      },
    ],
  };
  width = 550;
  height = 550;
  radius = Math.min(this.width, this.height) / 2;
  colors: any;
  totalSize: any;
  vis: any;
  partition: any;
  arc: any;
  b = {
    w: 75,
    h: 30,
    s: 3,
    t: 10,
  };
  ngOnInit(): void {
    this.colors = d3.scaleOrdinal();

    this.totalSize = 0;

    this.vis = d3
      .select("#chart")
      .append("svg:svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("svg:g")
      .attr("id", "container")
      .attr(
        "transform",
        "translate(" + this.width / 2 + "," + this.height / 2 + ")"
      );

    this.partition = d3.partition().size([2 * Math.PI, 100]);
    // .value((d: any) => d.size);

    this.arc = d3
      .arc()
      .startAngle((d: any) => d.x)
      .endAngle((d: any) => d.x + d.dx)
      .innerRadius((d: any) => (this.radius * Math.sqrt(d.y)) / 10)
      .outerRadius((d: any) => (this.radius * Math.sqrt(d.y + d.dy)) / 10);
  }

  createVisualization(json);

  createVisualization(json) {
    this.initializeBreadcrumbTrail();

    d3.select("#togglelegend").on("click", this.toggleLegend);

    this.vis.append("svg:circle").attr("r", this.radius).style("opacity", 0);

    var nodes = this.partition.nodes(json).filter((d) => d.dx > 0.005);

    var uniqueNames = ((a) => {
      var output = [];
      a.forEach((d) => {
        if (output.indexOf(d.name) === -1) {
          output.push(d.name);
        }
      });
      return output;
    })(nodes);

    this.colors.domain(uniqueNames);

    var path = this.vis
      .data([json])
      .selectAll("path")
      .data(nodes)
      .enter()
      .append("svg:path")
      .attr("display", (d: any) => (d.depth ? null : "none"))
      .attr("d", this.arc)
      .attr("fill-rule", "evenodd")
      .style("fill", (d: any) => this.colors(d.name))
      .style("opacity", 1)
      .on("mouseover", this.mouseover);

    d3.select("#container").on("mouseleave", this.mouseleave);

    this.totalSize = path.node().__data__.value;
  }

  mouseover(d) {
    var percentage = ((100 * d.value) / this.totalSize).toPrecision(3);
    var percentageString = percentage + "%";
    if (parseFloat(percentage) < 0.1) {
      percentageString = "< 0.1%";
    }

    d3.select("#percentage").text(percentageString);

    d3.select("#explanation").style("visibility", "");

    var sequenceArray = this.getAncestors(d);
    this.updateBreadcrumbs(sequenceArray, percentageString);

    d3.selectAll("path").style("opacity", 0.3);

    this.vis
      .selectAll("path")
      .filter((node) => sequenceArray.indexOf(node) >= 0)
      .style("opacity", 1);
  }
  mouseleave(d) {
    d3.select("#trail").style("visibility", "hidden");

    d3.selectAll("path").on("mouseover", null);

    d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .on("end", () => {
        d3.select(this.chartElem.nativeElement).on("mouseover", this.mouseover);
      });

    d3.select("#explanation")
      .transition()
      .duration(1000)
      .style("visibility", "hidden");
  }

  getAncestors(node) {
    var path = [];
    var current = node;
    while (current.parent) {
      path.unshift(current);
      current = current.parent;
    }
    return path;
  }

  initializeBreadcrumbTrail() {
    var trail = d3
      .select("#sequence")
      .append("svg:svg")
      .attr("width", this.width)
      .attr("height", 50)
      .attr("id", "trail");
    trail.append("svg:text").attr("id", "endlabel").style("fill", "#000");
  }

  breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(this.b.w + ",0");
    points.push(this.b.w + this.b.t + "," + this.b.h / 2);
    points.push(this.b.w + "," + this.b.h);
    points.push("0," + this.b.h);
    if (i > 0) {
      points.push(this.b.t + "," + this.b.h / 2);
    }
    return points.join(" ");
  }

  updateBreadcrumbs(nodeArray, percentageString) {
    var g = d3
      .select("#trail")
      .selectAll("g")
      .data(nodeArray, (d: any) => d.name + d.depth);

    var entering = g.enter().append("svg:g");

    entering
      .append("svg:polygon")
      .attr("points", this.breadcrumbPoints)
      .style("fill", (d: any) => this.colors(d.name));

    entering
      .append("svg:text")
      .attr("x", (this.b.w + this.b.t) / 2)
      .attr("y", this.b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text((d: any) => d.name);

    g.attr(
      "transform",
      (d, i) => "translate(" + i * (this.b.w + this.b.s) + ", 0)"
    );

    g.exit().remove();

    d3.select("#trail")
      .select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (this.b.w + this.b.s))
      .attr("y", this.b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);

    d3.select("#trail").style("visibility", "");
  }

  drawLegend() {
    var li = {
      w: 75,
      h: 30,
      s: 3,
      r: 3,
    };

    var legend = d3
      .select("#legend")
      .append("svg:svg")
      .attr("width", li.w)
      .attr("height", this.colors.domain().length * (li.h + li.s));

    var g = legend
      .selectAll("g")
      .data(this.colors.domain())
      .enter()
      .append("svg:g")
      .attr("transform", (d, i) => "translate(0," + i * (li.h + li.s) + ")");

    g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", (d) => this.colors(d));

    g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text((d: any) => d);
  }

  toggleLegend() {
    var legend = d3.select("#legend");
    if (legend.style("visibility") == "hidden") {
      legend.style("visibility", "");
    } else {
      legend.style("visibility", "hidden");
    }
  }

  buildHierarchy(csv) {
    var root = { name: "root", children: [] };
    for (var i = 0; i < csv.length; i++) {
      var sequence = csv[i][0];
      var size = +csv[i][1];
      if (isNaN(size)) {
        continue;
      }
      var parts = sequence.split("-");
      var currentNode = root;
      for (var j = 0; j < parts.length; j++) {
        var children = currentNode["children"];
        var nodeName = parts[j];
        var childNode;
        if (j + 1 < parts.length) {
          var foundChild = false;
          for (var k = 0; k < children.length; k++) {
            if (children[k]["name"] == nodeName) {
              childNode = children[k];
              foundChild = true;
              break;
            }
          }
          if (!foundChild) {
            childNode = { name: nodeName, children: [] };
            children.push(childNode);
          }
          currentNode = childNode;
        } else {
          childNode = { name: nodeName, size: size };
          children.push(childNode);
        }
      }
    }
    return root;
  }
}
