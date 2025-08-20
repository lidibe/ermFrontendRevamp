import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-kri-data',
  templateUrl: './kri-data.component.html',
  styleUrls: ['./kri-data.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KriDataComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
