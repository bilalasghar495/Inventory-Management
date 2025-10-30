import { inject, Injectable } from '@angular/core';
import { io,Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket!: Socket;
  readonly userService = inject( UserService );

  constructor() { }

  connect( shopDomain: string ): void {

    this.socket = io( environment.socketUrl, {
      transports: ['websocket'],
      secure: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      query: {
        shop: shopDomain,
      },
    });

    // Add connection event listeners
    this.socket.on('connect', () => {
      console.log( 'WebSocket CONNECTED - Socket ID:', this.socket.id );
    });

    this.socket.on('disconnect', (reason) => {
      console.log( 'WebSocket DISCONNECTED - Reason:', reason );
    });

    this.socket.on('connect_error', (error) => {
      console.error( 'WebSocket CONNECTION ERROR:', error );
    });
  }


  listen( eventName: string ): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on( eventName, ( data ) => {
        subscriber.next( data );
      });
    });
  }
}
