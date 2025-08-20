import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'detailrow',
  templateUrl: './detailrow.component.html',
  styleUrls: ['./detailrow.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DetailRowComponent implements OnInit {
  @Input() label = '';
  @Input() value = '';
  @Input() flexLabel = 50;
  @Input() flexValue = 50;
  @Input() format = false;
  @Input() color = '';

  constructor() {
    this.flexLabel = this.flexLabel || 50;
    this.flexValue = this.flexValue || 50;
  }

  ngOnInit(): void {
  }
}
