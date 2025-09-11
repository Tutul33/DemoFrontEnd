import { inject, Injectable } from '@angular/core';
import { GlobalMethods } from '../models/javascriptMethods';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PdfViewerService } from './pdf.viewer.service';
import { LoadingService } from './loading-service';

@Injectable({
  providedIn: 'root'
})
export class ReportDataService {
  private pdfService = inject(PdfViewerService);
  reportUrl: string = GlobalMethods.ApiUrl() + 'Reports/';
  constructor(private http: HttpClient,private loadingSvc:LoadingService) {

  }

  getReport(entity: any): Observable<any> {
    return this.http.post(this.reportUrl + 'ShowReports', entity);
  }
  printReport(reportData: any, isDownload: boolean) {
    try {
      this.loadingSvc.show();
      this.getReport(reportData).subscribe({
        next: async (res: any) => {
          let fileName = res.data.fileName;
          let extension;

          switch (reportData.reportType) {
            case GlobalMethods.reportRenderingType.PDF:
              extension = "pdf";
              break;
            case GlobalMethods.reportRenderingType.Excel:
              extension = "xlsx";
              break;
            case GlobalMethods.reportRenderingType.word:
              extension = "docx";
              break;
            case GlobalMethods.reportRenderingType.Image:
              extension = "png";
              break;
            default:
              extension = "";
          }

          if (extension == "pdf" && !isDownload) {
            //this.openInBrowser(extension,fileName);
            this.pdfView(extension, fileName)
          } else {
            this.download(extension, fileName);
          }
        },
        error: (res: any) => { },
      });
    } catch (e) {
      throw e;
    }
  }
  downloadReport(fileType: string, fileName: string) {
    try {
      return this.http.get(`${this.reportUrl}download/${fileType}/${fileName}`, {
        responseType: 'blob'
      });
    } catch (error) {
      throw error;
    }
  }

  download(fileType: string, fileName: string) {
    try {
      this.downloadReport(fileType, fileName).subscribe(blob => {
        this.loadingSvc.hide();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    } catch (error) {
      this.loadingSvc.hide();
      throw error;
    }
  }

  pdfView(fileType: string, fileName: string) {
    try {
      this.downloadReport(fileType, fileName).subscribe({
        next: (blob: Blob) => {
          // Ensure blob type is correct
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });

          // Create a blob URL
          const blobUrl = URL.createObjectURL(pdfBlob);

          // Open in the global PDF viewer
          this.pdfService.open(blobUrl,fileName);
          this.loadingSvc.hide();
        },
        error: (err) => {
          this.loadingSvc.hide();
          throw err;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  openInBrowser(extension, fileName) {
    try {
      this.loadingSvc.hide();
      const url = GlobalMethods.ApiHost() + "reports/" + extension + "/" + fileName;
      window.open(url, '_blank');
    } catch (error) {
      throw error;
    }
  }
}
