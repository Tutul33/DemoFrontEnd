import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from './../../services/loading-service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div
      *ngIf="loadingService.loading()"
      class="loading-overlay"
    >
      <p-progressSpinner strokeWidth="4"></p-progressSpinner>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.3);
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class LoadingSpinner {
  loadingService = inject(LoadingService);
}