import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  // Using BehaviorSubject for traditional reactive approach
  private messageSource = new BehaviorSubject<string>('Initial Message');
  currentMessage$ = this.messageSource.asObservable();

  private counterSource = new BehaviorSubject<number>(0);
  currentCounter$ = this.counterSource.asObservable();

  // Using Signal for modern reactive approach
  count = signal<number>(0);
  message = signal<string>('Initial Signal Message');

  constructor() { }

  // Methods for BehaviorSubject
  updateMessage(message: string): void {
    this.messageSource.next(message);
  }

  updateCounter(value: number): void {
    this.counterSource.next(value);
    this.count.set(value); // Update signal as well to keep both in sync
  }

  // Methods for Signals
  incrementCount(): void {
    this.count.update(value => value + 1);
  }

  decrementCount(): void {
    this.count.update(value => value - 1);
  }

  updateSignalMessage(newMessage: string): void {
    this.message.set(newMessage);
  }
}
