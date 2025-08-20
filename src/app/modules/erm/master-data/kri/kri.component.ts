import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-master-data-kri',
  templateUrl: './kri.component.html',
  styleUrls: ['./kri.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KriComponent
{
  /**
   * Constructor
   */
  constructor()
  {
  }
}
