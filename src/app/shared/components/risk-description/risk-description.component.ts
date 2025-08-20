import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-risk-description",
  templateUrl: "./risk-description.component.html",
  styleUrls: ["./risk-description.component.scss"],
})
export class RiskDescriptionComponent implements OnInit {
  @Input() title!: string;
  @Input() header!: string;
  @Input() para: string = "";
  constructor() {}

  ngOnInit(): void {}
}
