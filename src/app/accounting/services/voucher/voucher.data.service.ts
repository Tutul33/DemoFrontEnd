import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalMethods } from '../../../shared/models/javascriptMethods';

@Injectable()
export class VoucherDataService {
   url: string = GlobalMethods.ApiUrl()+'voucher/';
   constructor(private http: HttpClient) {

   }
   
   getVoucherApprovalList(search, FromDate: Date, ToDate: Date, VoucherType: string, userIds: string, voucherNos: string, status: string, pageNumber: number, pageSize: number): Observable<any> {
      let queryString = '?';
      if (userIds)
         queryString += 'userIds=' + userIds;
      if (voucherNos)
         queryString += '&voucherNos=' + voucherNos;
      if (FromDate) {
         const formattedDate = formatDate(FromDate, 'yyyy-MM-dd', 'en-US');
         queryString += '&fromDate=' + formattedDate;
      }

      if (ToDate) {
         const formattedDate = formatDate(ToDate, 'yyyy-MM-dd', 'en-US');
         queryString += '&toDate=' + formattedDate;
      }
      if (VoucherType)
         queryString += '&VoucherType=' + VoucherType;
      if (search)
         queryString += '&search=' + search;

      queryString += '&status=' + status + '&PageNumber=' + pageNumber + '&PageSize=' + pageSize;

      return this.http.get<any>(
         this.url + `GetVoucherList` + queryString
      );
   }

   getVoucherDetailByVoucherNo(voucherNo: string): Observable<any> {   
      return this.http.get<any>(
         this.url + `GetVoucherDetailsByVoucherNo?voucherNo=` + voucherNo
      );
   }

   getChartOfAccounts(): Observable<any> {   
      return this.http.get<any>(
         this.url + `GetChartOfAccounts`
      );
   }

   GetFinanceAndAccountUsers(): Observable<any> {   
      return this.http.get<any>(
         this.url + `GetFinanceAndAccountUsers`
      );
   }

   updateVoucher(voucherList: any): Observable<any> {
        return this.http.put<any>(
            this.url+`UpdateVoucher`,
            voucherList
        );
    }
    
   UpdateVoucherCheckApprove(voucherList: any): Observable<any> {
        return this.http.put<any>(
            this.url+`UpdateVoucherCheckApprove`,
            voucherList
        );
    }
   
    referVoucher(refer:any): Observable<any> {
        return this.http.post<any>(
            this.url+`ReferVoucher`,
            refer
        );
    }
}
