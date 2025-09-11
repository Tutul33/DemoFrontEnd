import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  confirm(options: {
    event?: Event,
    message?: string,
    icon?: string,
    acceptLabel?: string,
    rejectLabel?: string,
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
