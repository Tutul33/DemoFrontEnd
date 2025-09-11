import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalMethods } from '../../shared/models/javascriptMethods';

@Injectable({
  providedIn: 'root'
})
export class UserRoleMapDataService {
   url: string = GlobalMethods.ApiUrl()+'User/';
   constructor(private http: HttpClient) {

   }
   
   getUserRoleMapList(): Observable<any> {      
      return this.http.get<any>(
         this.url + `GetUsersRoleMap`
      );
   }

   updateUserRoleMap(data:any): Observable<any> {
        return this.http.post<any>(
            this.url+`UpdateUserRoleMap`,
            data
        );
    }

    getFinanceAndAccountUsersRole(): Observable<any> {      
      return this.http.get<any>(
         this.url + `GetFinanceAndAccountUsersRole`
      );
   }
}
