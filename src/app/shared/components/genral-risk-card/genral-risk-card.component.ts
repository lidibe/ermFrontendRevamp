import { Component, Input, OnChanges } from "@angular/core";

@Component({
  selector: "app-genral-risk-card",
  templateUrl: "./genral-risk-card.component.html",
  styleUrls: ["./genral-risk-card.component.scss"],
})
export class GenralRiskCardComponent implements OnChanges {
  @Input() title = "";
  @Input() month!: string;
  @Input() year!: string;
  @Input() data!: any[];
  lastValue = 0;
  beforeLastValue = 0;
  ratio = 0;
  scale = "neutral";
  generalScale = "neutral";
  isAvailable = false;
  ngOnChanges(): void {
    this.isAvailable = this.data?.[this.data?.length - 1]?.currentData ?? false;
    this.lastValue = this.data?.[this.data?.length - 1]?.value;
    this.beforeLastValue = this.data?.[this.data?.length - 2]?.value || null;
    this.isAvailable && !isNaN(this.lastValue)
      ? this.toRatio()
      : (this.generalScale = "neutral");
  }
  toRatio() {
    this.ratio = this.lastValue - this.beforeLastValue;

    if (this.lastValue >= 75) {
      this.generalScale = "good";
    } else if (this.lastValue < 50) {
      this.generalScale = "bad";
    }
  }
}
