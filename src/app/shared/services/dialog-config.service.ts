import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root',
})
export class DialogConfigService {

  constructor(private breakpointObserver: BreakpointObserver) {}

  getDialogConfig(data: any): Promise<MatDialogConfig> {
    return new Promise<MatDialogConfig>((resolve) => {
      let dialogConfig: MatDialogConfig = {
        data: data,
      };

      this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((state: BreakpointState) => {
        if (state.matches) {
          dialogConfig = {
            ...dialogConfig,
            width: '95vw',
            maxWidth: '95vw',
          };
        }
        resolve(dialogConfig);
      });
    });
  }
}