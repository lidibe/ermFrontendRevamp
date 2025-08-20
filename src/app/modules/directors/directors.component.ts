import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector       : 'directors',
    templateUrl    : './directors.component.html',
    styleUrls      : ['./directors.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports        : [RouterOutlet],
    standalone     : true
})
export class DirectorComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
