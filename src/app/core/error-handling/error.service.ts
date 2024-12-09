import { Injectable, signal } from '@angular/core';

export interface ErrorMessage {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSignal = signal<ErrorMessage[]>([]);
  errors = this.errorSignal.asReadonly();

  showError(message: string) {
    this.addMessage(message, 'error');
  }

  showWarning(message: string) {
    this.addMessage(message, 'warning');
  }

  showInfo(message: string) {
    this.addMessage(message, 'info');
  }

  private addMessage(message: string, type: ErrorMessage['type']) {
    const newError: ErrorMessage = {
      message,
      type,
      timestamp: new Date()
    };

    this.errorSignal.update(errors => [...errors, newError]);

    // Auto-remove the message after 5 seconds
    setTimeout(() => {
      this.errorSignal.update(errors => 
        errors.filter(e => e !== newError)
      );
    }, 5000);
  }

  clearErrors() {
    this.errorSignal.set([]);
  }
}
