import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';

import { AsyncPipe, CommonModule, TitleCasePipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Trail } from 'app/shared/types/trail.types';
import { Observable } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-trails-overview',
    templateUrl: './trails-overview.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatDividerModule, MatIconModule, MatTooltipModule, MatExpansionModule, AsyncPipe,
        TitleCasePipe
    ],
    standalone: true,
})
export class TrailsOverViewComponent implements OnInit, OnDestroy {
    @Input('trails') trails$: Observable<Trail[]>;
    panelOpenState: boolean = false;
    constructor() {}

    ngOnInit(): void {
    }

    ngOnDestroy(): void {}
}
