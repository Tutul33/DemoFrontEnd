import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PdfViewerService {
  _visible = false;
  private _pdfSrc = '';
  _downloadFileName = "";
  open(src: string,downloadFileName: string) {
    this._pdfSrc = src;
    this._visible = true;
    this._downloadFileName = downloadFileName;
  }

  close() {
    this._visible = false;
  }

  pdfSrc() {
    return this._pdfSrc;
  }

  downloadFileName(){
    return this._downloadFileName;
  }
}
