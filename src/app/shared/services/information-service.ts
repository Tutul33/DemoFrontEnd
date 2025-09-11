import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class InformationService {
  constructor( private messageService: MessageService){
    
  }

  showSuccessMsg(message:string){
     this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }
  showErrorMsg(message:string){
     this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }
  showWarningMsg(message:string){
     this.messageService.add({ severity: 'warn', summary: 'Warning', detail: message });
  }
  showInfoMsg(message:string){
     this.messageService.add({ severity: 'info', summary: 'Info', detail: message });
  }
}
