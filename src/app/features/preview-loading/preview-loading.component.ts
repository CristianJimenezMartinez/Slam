import { Component } from '@angular/core';

@Component({
  selector: 'app-preview-loading',
  template: `
    <app-loading-spinner [fullScreen]="true"></app-loading-spinner>
  `
})
export class PreviewLoadingComponent {}
