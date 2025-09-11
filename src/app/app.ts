import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from "./shared/component/toast/toast";
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from './shared/component/loading-spinner/loading-spinner';
import { Confirm } from "./shared/component/confirm/confirm";
import { PdfViewer } from './shared/component/pdf-viewer/pdf-viewer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, LoadingSpinner, CommonModule, Confirm,PdfViewer],
  templateUrl: './app.html'
})
export class App {
  isLoggedIn:boolean=false;
  protected readonly title = signal('SolApp');
  constructor(){
  }

  ngOnInit(){
    
  }
}
