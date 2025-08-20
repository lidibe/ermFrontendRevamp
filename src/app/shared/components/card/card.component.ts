import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

@Component({
  selector: "app-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
})
export class CardComponent implements OnChanges {
  @Input() title = "";
  @Input() link = "";
  @Input() id = 0;
  @Input() currentData!: boolean;
  @Input() data!: any[];
  lastValue!: number;
  beforeLastValue = 0;
  ratio!: number;
  scale = "neutral";
  generalScale = "neutral";
  isAvailable = false;

  ngOnChanges(changes: SimpleChanges) {
    this.isAvailable = this.currentData ?? false;
    this.lastValue = this.data?.[this.data?.length - 1]?.value;
    this.beforeLastValue = this.data?.[this.data?.length - 2]?.value || null;
    this.currentData && !isNaN(this.lastValue)
      ? this.toRatio()
      : ((this.scale = "neutral"), (this.generalScale = "neutral"));
  }
  toRatio() {
    this.ratio = this.lastValue - this.beforeLastValue;
    if (this.ratio > 0) {
      this.scale = "good";
    } else if (this.ratio < 0) {
      this.scale = "bad";
    }
    if (this.lastValue >= 75) {
      this.generalScale = "good";
    } else if (this.lastValue < 50) {
      this.generalScale = "bad";
    }
  }
}
