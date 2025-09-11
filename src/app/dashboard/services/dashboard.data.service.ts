import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
   url:string='http://localhost:5020/api/login/';
   constructor(private http: HttpClient) {

    }
  getDashboardData(email: string, password: string): Observable<any> {
        return this.http.get<any>(
            this.url+`login`
        );
    }
}
