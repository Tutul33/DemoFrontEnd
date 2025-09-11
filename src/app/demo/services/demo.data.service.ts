import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalMethods } from '../../shared/models/javascriptMethods';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DemoDataService {
  url: string = GlobalMethods.ApiUrl()+'demo/';
   constructor(private http: HttpClient) {

   }

  save(formData: FormData): Observable<any> {
  return this.http.post<any>(this.url + 'Save', formData);
  }

  getDemoList(): Observable<any> {   
      return this.http.get<any>(
         this.url + `getDemoList` 
      );
   }

  getDemoById(id: number): Observable<any> {   
      return this.http.get<any>(
         this.url + `getDemoById?id=` + id
      );
   }

  delete(id: number): Observable<any> {   
      return this.http.delete<any>(
         this.url + `delete?id=` + id
      );
   }

  
}
