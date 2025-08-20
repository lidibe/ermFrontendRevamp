import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit } from '@angular/core';

@Component({
  selector: 'app-threshold',
  templateUrl: './threshold.component.html',
  styleUrls: ['./threshold.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThresholdComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
