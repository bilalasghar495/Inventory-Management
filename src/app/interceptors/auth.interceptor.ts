import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from '../Services/user-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor( private userService: UserService ) {}

  intercept( req: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {
    const token = this.userService.getToken();

    if ( token ) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        },
      });
    }

    return next.handle( req );
  }
}