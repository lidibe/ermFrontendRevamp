import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector       : 'app-committees',
    templateUrl    : './committees.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports        : [RouterOutlet],
    standalone     : true
})
export class CommitteesComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
