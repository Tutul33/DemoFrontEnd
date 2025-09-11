import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalMethods } from '../models/javascriptMethods';

@Injectable({
  providedIn: 'root'
})
export class LoginDataService {
   url:string= GlobalMethods.ApiUrl()+'login/';
   constructor(private http: HttpClient) {

    }
  login(email: string, password: string): Observable<any> {
        return this.http.post<any>(
            this.url+`login`,
            { userName:email, password}
        );
    }
}
