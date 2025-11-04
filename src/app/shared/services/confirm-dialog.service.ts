import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  constructor(
    private confirmationService: ConfirmationService
  ) {}

  confirm(options: {
    event?: Event,
    message?: string,
    icon?: string,
    acceptLabel?: string,
    rejectLabel?: string,
    style?: string,
    onAccept: () => void,
    onReject?: () => void
  }) {
    this.confirmationService.confirm({
      target: options.event?.currentTarget as EventTarget,
      message: options.message || 'Are you sure?',
      icon: options.icon || 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: options.acceptLabel || 'Yes'
      },
      rejectButtonProps: {
        label: options.rejectLabel || 'No',
        severity: 'secondary',
        outlined: true
      },
      accept: () => {
        options.onAccept();
      },
      reject: () => {
        options.onReject?.();
      }
    });
  }
}
