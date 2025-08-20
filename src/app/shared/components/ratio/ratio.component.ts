import { Component, Input, OnChanges } from "@angular/core";

@Component({
  selector: "app-ratio",
  templateUrl: "./ratio.component.html",
  styleUrls: ["./ratio.component.scss"],
})
export class RatioComponent implements OnChanges {
  @Input() ratio?: number;
  @Input() generalScale!: string;
  scale!: string;
  constructor() {}
  ngOnChanges(): void {
    this.scale = this.ratio === 0 ? "neutral" : this.ratio > 0 ? "good" : "bad";
  }
}
