import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-risk-data-summary-data',
  templateUrl: './summary-data.component.html',
  styleUrls: ['./summary-data.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryDataComponent
{
  /**
   * Constructor
   */
  constructor()
  {
  }
}
