import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

// Example singleton services
// import { AuthService } from './services/auth.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    // AuthService,
  ]
})
export class CoreModule {
  // Guard against re-importing core
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) throw new Error('CoreModule is already loaded. Import in AppModule only.');
  }

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        // global providers here if needed
      ]
    };
  }
}
