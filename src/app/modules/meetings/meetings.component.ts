import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector       : 'meetings',
    templateUrl    : './meetings.component.html',
    styleUrls      : ['./meetings.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet],
    standalone: true
})
export class MeetingComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
