import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IdCard } from '../directors.types';

@Component({
    selector: 'app-id-card-details',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
    templateUrl: './id-card-details.component.html',
})
export class IdCardDetailsComponent {
    @Input() idc: IdCard;
}
