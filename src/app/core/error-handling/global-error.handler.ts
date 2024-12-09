import { ErrorHandler, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      // Handle HTTP Errors
      console.error('🌐 HTTP Error occurred:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });
    } else {
      // Handle Runtime Errors
      console.error('⚡ Runtime Error occurred:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    // You can add additional error handling logic here
    // For example, showing a toast notification or redirecting to an error page
  }
}
