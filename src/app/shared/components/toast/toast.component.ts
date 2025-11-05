import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../../Services/toast.service';
import { ToastTypeEnum } from '../../enums/enum';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  readonly toastService = inject( ToastService );
  readonly ToastTypeEnum = ToastTypeEnum;
  
  toasts: Toast[] = [];
  private subscription!: Subscription;

  constructor() {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe((toast) => {
      this.toasts.push(toast);
      
      // Auto remove toast after duration
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration || 3000);
    });
  }


  ngOnDestroy() {
    if ( this.subscription ) {
      this.subscription.unsubscribe();
    }
  }


  removeToast( id: number ) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }


  getToastClasses( type: ToastTypeEnum ): string {
    const baseClasses = 'flex items-center p-4 mb-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out';
    const typeClasses: Record<ToastTypeEnum, string> = {
      [ToastTypeEnum.Success]: 'bg-green-50 text-green-800 border-l-4 border-green-500',
      [ToastTypeEnum.Error]: 'bg-red-50 text-red-800 border-l-4 border-red-500',
      [ToastTypeEnum.Warning]: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500',
      [ToastTypeEnum.Info]: 'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
    };
    return `${baseClasses} ${typeClasses[type]}`;
  }


  getIconPath( type: ToastTypeEnum ): string {
    switch(type) {
      case ToastTypeEnum.Success:
        return 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z';
      case ToastTypeEnum.Error:
        return 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z';
      case ToastTypeEnum.Warning:
        return 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z';
      case ToastTypeEnum.Info:
      default:
        return 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z';
    }
  }

  
  getIconColor(type: ToastTypeEnum): string {
    switch(type) {
      case ToastTypeEnum.Success: return 'text-green-500';
      case ToastTypeEnum.Error: return 'text-red-500';
      case ToastTypeEnum.Warning: return 'text-yellow-500';
      case ToastTypeEnum.Info: return 'text-blue-500';
      default: return 'text-gray-500';
    }
  }
}

