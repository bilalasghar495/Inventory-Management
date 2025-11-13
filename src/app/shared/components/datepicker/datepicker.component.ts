import { Component, input, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { enGbLocale } from 'ngx-bootstrap/locale';

// Define locale for datepicker
defineLocale('en-gb', enGbLocale);

@Component({
  standalone: true,
  selector: 'app-datepicker',
  imports: [CommonModule, FormsModule, BsDatepickerModule],
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent {
  // Input properties for UI configuration
  readonly datepickerId = input<string>('datepicker-default');
  readonly label        = input<string>('Select date');
  readonly placeholder  = input<string>('Select date');
  readonly value        = input<string | null>(null);
  readonly valueChange  = output<string | null>();
  
  // Internal date value for ngModel binding (Date object for ngx-bootstrap)
  internalDate: Date | null = null;
  
  // Track if this is the first initialization
  private isInitialized = false;
  
  // Datepicker configuration
  readonly datepickerConfig: Partial<BsDatepickerConfig> = {
    containerClass: 'theme-default',
    dateInputFormat: 'DD/MM/YYYY',
    showWeekNumbers: false,
    adaptivePosition: true
  };

  constructor() {
    // Sync external string value to internal Date object
    effect(() => {
      const val = this.value();
      
      if ( val && typeof val === 'string' ) {
        const date = new Date(val);
        if ( !isNaN(date.getTime() )) {
          this.internalDate = date;
        } else {
          this.internalDate = null;
        }
      } else if ( ( val === null || val === undefined || val === '' ) && !this.isInitialized ) {
        // If no value is provided on first load, set to current date by default and emit it
        this.internalDate = new Date();
        this.isInitialized = true;
        
        // Emit the default date so parent component has a value
        const dateString = this.internalDate.toISOString().split('T')[0];
        this.valueChange.emit( dateString );
      }
    });
  }

  onDateChange( date: Date | null ): void {
    // Convert Date to ISO string and emit
    if ( date && !isNaN(date.getTime()) ) {
      const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      this.valueChange.emit( dateString );
    } else {
      this.valueChange.emit( null );
    }
  }

  openDatepicker( inputElement: HTMLInputElement ): void {
    // Trigger click on input to open datepicker
    inputElement.click();
  }
}

