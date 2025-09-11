import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { PdfViewerService } from '../../services/pdf.viewer.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, DialogModule, NgxExtendedPdfViewerModule],
  templateUrl: './pdf-viewer.html',
})
export class PdfViewer {
  service = inject(PdfViewerService);

  constructor() {
    pdfDefaultOptions.assetsFolder = 'assets';
  }

  onDialogClose() {
    this.service._visible = false; 
  }
}
