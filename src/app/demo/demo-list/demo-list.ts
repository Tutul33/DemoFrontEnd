import { Component } from '@angular/core';
import { DemoModelService } from '../services/demo.model.service';
import { InformationService } from '../../shared/services/information-service';
import { DemoDataService } from '../services/demo.data.service';
import { TableModule } from 'primeng/table';
import { BooleanToYesNoPipe } from '../../shared/pipes/boolean-to-yes-no-pipe';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { LoadingService } from '../../shared/services/loading-service';
import { GlobalMethods } from '../../shared/models/javascriptMethods';
import { ReportDataService } from '../../shared/services/report-data-service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-demo-list',
  imports: [TableModule, BooleanToYesNoPipe, FormsModule, DatePipe,ButtonModule],
  templateUrl: './demo-list.html',
  styleUrl: './demo-list.css'
})
export class DemoList {
  reportRenderingType:any=GlobalMethods.reportRenderingType;
  constructor(
    private dataSvc: DemoDataService, 
    public modelSvc: DemoModelService, 
    private msgSvc: InformationService, 
    private router: Router,
    private loadingSvc:LoadingService,
    private reportSvc:ReportDataService
  ) {

  }

  ngOnInit() {
    this.getDemoList();
  }

  getDemoList() {
    try {
      this.dataSvc.getDemoList().subscribe({
        next: (res: any) => {
          this.modelSvc.prepareDemoList(res.data.list);
        },
        error: (error) => {
          this.msgSvc.showErrorMsg(error);
        }
      });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  routesToPage(id: number) {
    try {
      this.router.navigate(['/demo/demo-entry'], {
        queryParams: { id: id }
      });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  delete(data) {
    try {
      this.loadingSvc.show();
      this.dataSvc.delete(data.id).subscribe({
        next: (res) => {
          this.loadingSvc.hide();
          if (res.data)
            this.msgSvc.showSuccessMsg("Deleted Successfully.");

          this.modelSvc.prepareDataOnDelete(data);
        },
        error: (err) => {
          this.loadingSvc.hide();
          this.msgSvc.showErrorMsg(err);
        }
      });
    } catch (error) {
      this.loadingSvc.hide();
      this.msgSvc.showErrorMsg(error);
    }
  }

  print(data,type) {
    try {
     
      this.dataSvc.getDemoById(data.id).subscribe({
        next: (res: any) => {
          let reportData = this.prepareVoucherOption(res.data,type);
          this.reportSvc.printReport(reportData,false);
        },
        error: (res: any) => {
          throw res;
        }
      });
    } catch (e) {
      throw e;
    }
  }
  private prepareVoucherOption(data: any[],type) {
    try {
      let title = null;
      if (data.length > 0) title = data[0].title;
      
      return {
        reportName: 'Sample',
        reportType: type,
        userID: 1,
        data: this.modelSvc.prepareDateForPrint(data),
        params: this.getRptParameter(title),
        dataSetName: "Sp_DataPrint",
      };
    } catch (e) {
      throw e;
    }
  }

  getRptParameter(title: string) {
    try {
      var params = [
        {
          key: "Title",
          value: "Report Testing",
        }       
      ];
      return params;
    } catch (e) {
      throw e;
    }
  }

  routesToEntry() {
    try {
      this.router.navigate(['/demo/demo-entry']);
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }
}
