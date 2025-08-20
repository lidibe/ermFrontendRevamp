import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit } from '@angular/core';

@Component({
  selector: 'app-risk-area',
  templateUrl: './risk-area.component.html',
  styleUrls: ['./risk-area.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAreaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
