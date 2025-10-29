import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

	protected baseApiUrl : string = `${environment.apiUrl}`;
  
  // API URLS
  readonly API_URLS = {
    SIGNUP        : `${this.baseApiUrl}/signup`,
    LOGIN         : `${this.baseApiUrl}/login`,
    APP_STATUS    : `${this.baseApiUrl}/appstatus`,
    GET_USER      : `${this.baseApiUrl}/user`,
  };

  // Store user data in memory for quick access
  private currentUser$ = new BehaviorSubject<IUser | null>(null);
  public  user$        = this.currentUser$.asObservable();


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
        
        // Save shop URL if it exists against this user
        if ( res?.shop ) {
          this.saveStoreUrl( res.shop );
        }
        // Save user ID if it exists against this user
        if ( res?.userId ) {
          this.saveUserId( res.userId );
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
			name             : data?.name,
      email            : data?.email,
			password         : data?.password,
    };

    return this.http.post( this.API_URLS.SIGNUP, dataToSend ).pipe(map( res => res ));
  }


  getUser( userId: string ): Observable<IUser> {
    const params = new HttpParams().set( 'userId', userId );
  
    return this.http.get<IUser>(this.API_URLS.GET_USER, { params: params }).pipe(
      tap((user) => {
        this.currentUser$.next(user);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('storeUrl');
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


  setRedirectUrl( url: string ): void {
    sessionStorage.setItem('redirectUrl', url);
  }


  getRedirectUrl(): string | null {
    return sessionStorage.getItem('redirectUrl');
  }


  clearRedirectUrl(): void {
    sessionStorage.removeItem('redirectUrl');
  }


  registerStore( shop: string ): Observable<any> {
    const dataToSend = { shop };
    return this.http.post( this.API_URLS.APP_STATUS, dataToSend ).pipe(map( res => res ));
  }
  

  saveStoreUrl( storeUrl: string ): void {
    localStorage.setItem( 'storeUrl', storeUrl );
  }


  getStoreUrl(): string | null {
    const storeUrl = localStorage.getItem('storeUrl');
    return storeUrl;
  }


  saveUserId( userId: string ): void {
    localStorage.setItem( 'userId', userId );
  }
  

  getUserId(): string | null {
    return localStorage.getItem( 'userId' );
  }
  
}