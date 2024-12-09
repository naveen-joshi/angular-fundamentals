import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService } from './error.service';

@Component({
  selector: 'app-error-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      @for (error of errorService.errors(); track error.timestamp) {
        <div 
          class="p-4 rounded-lg shadow-lg animate-slide-in"
          [ngClass]="{
            'bg-red-100 border-l-4 border-red-500 text-red-700': error.type === 'error',
            'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700': error.type === 'warning',
            'bg-blue-100 border-l-4 border-blue-500 text-blue-700': error.type === 'info'
          }"
        >
          <div class="flex justify-between items-start">
            <p class="text-sm">{{ error.message }}</p>
            <button 
              class="ml-4 text-gray-400 hover:text-gray-600"
              (click)="errorService.clearErrors()"
            >
              ✕
            </button>
          </div>
          <p class="text-xs mt-1 opacity-75">
            {{ error.timestamp | date:'HH:mm:ss' }}
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ErrorMessagesComponent {
  errorService = inject(ErrorService);
}
