import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

	protected baseApiUrl : string = `${environment.apiUrl}`;
  
  // API URLS
  readonly API_URLS = {
    SIGNUP: `${this.baseApiUrl}/signup`,
    LOGIN: `${this.baseApiUrl}/login`
  };


  constructor( private http: HttpClient ) { }


  login( email: string, password: string ): Observable<any> {
    this.logout();

    const dataToSend = { email, password };

    return this.http.post( this.API_URLS.LOGIN, dataToSend ).pipe(
      tap((res: any) => {
        if ( res?.token ) {
          this.saveToken( res.token );
        } else {
          throw new Error( 'Valid token not returned' );
        }
      }),
      catchError(( error ) => {
        console.error( 'Login failed:', error );
        return throwError( () => error );
      })
    );
  }


  signUp( data: any ): Observable<any> {

    const dataToSend = { 
      email            : data?.email?.trim(),
			password         : data?.password,
			firstName        : data?.firstName?.trim(),
    };

    return this.http.post( this.API_URLS.SIGNUP, dataToSend ).pipe(map( res => res ));
  }


  logout(): void {
    localStorage.removeItem('token');
  }


  saveToken( token: string ): void {
    localStorage.setItem( 'token', token );
  }


  getToken(): string | null {
    const token = localStorage.getItem('token');
    return token;
  }


  isAuthenticated(): boolean {
    return !!this.getToken();
  }

}