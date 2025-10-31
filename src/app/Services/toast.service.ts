import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastTypeEnum } from '../shared/enums/enum';

export interface Toast {
  id: number;
  message: string;
  type: ToastTypeEnum;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toast$ = this.toastSubject.asObservable();
  private toastId = 0;

  show( message: string, type: ToastTypeEnum = ToastTypeEnum.Info, duration: number = 3000 ) {
    const toast: Toast = {
      id: ++this.toastId,
      message,
      type,
      duration
    };
    this.toastSubject.next(toast);
  }

  success( message: string, duration?: number ) {
    this.show(message, ToastTypeEnum.Success, duration);
  }

  error( message: string, duration?: number ) {
    this.show( message, ToastTypeEnum.Error, duration );
  }

  info( message: string, duration?: number ) {
    this.show( message, ToastTypeEnum.Info, duration );
  }

  warning( message: string, duration?: number ) {
    this.show( message, ToastTypeEnum.Warning, duration );
  }
}

