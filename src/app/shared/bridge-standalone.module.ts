import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Example: re-export a standalone widget so classic modules can use it
// import { SomeStandaloneCardComponent } from '../widgets/some-standalone-card/some-standalone-card.component';

@NgModule({
  imports: [
    CommonModule,
    // SomeStandaloneCardComponent,
  ],
  exports: [
    // SomeStandaloneCardComponent,
  ],
})
export class BridgeStandaloneModule {}
