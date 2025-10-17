import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

	protected baseApiUrl : string = `${environment.apiUrl}`;
  
  // API URLS
  readonly API_URLS = {
    SIGNUP: `${this.baseApiUrl}/signup`,
    LOGIN: `${this.baseApiUrl}/login`
  };


  constructor( private http: HttpClient ) { }


  signup(data: { name: string, email: string, password: string }): Observable<any> {
    return this.http.post(this.API_URLS.SIGNUP, data);
  }

  login(data: { email: string, password: string }): Observable<any> {
    return this.http.post(this.API_URLS.LOGIN, data);
  }

}