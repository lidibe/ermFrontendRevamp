import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-container',
  templateUrl: './dialog-container.component.html',
  standalone: true,
  imports: [MatButtonModule, MatIconModule]
})
export class DialogContainerComponent implements OnInit {

  @Input() title: string = 'Add Group';
  @Output() onCloseDialog = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.onCloseDialog.emit();
  }

}
