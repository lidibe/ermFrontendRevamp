import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector       : 'app-organizations',
    templateUrl    : './organizations.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports        : [RouterOutlet],
    standalone     : true
})
export class OrganizationsComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
