import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../service/shared.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-child2',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 border rounded-lg bg-green-50">
      <h3 class="text-lg font-semibold">Child 2</h3>
      
      <!-- Receiving from Parent -->
      <div class="mt-2">
        <p>Message from Parent: {{ messageFromParent }}</p>
      </div>

      <!-- Sending to Parent -->
      <div class="mt-4">
        <input 
          #childInput
          type="text" 
          [value]="childMessage"
          (input)="updateChildMessage(childInput.value)"
          class="px-3 py-1 border rounded"
          placeholder="Message to parent..."
        >
        <button 
          (click)="sendMessageToParent()"
          class="ml-2 px-3 py-1 bg-green-500 text-white rounded"
        >
          Send to Parent
        </button>
      </div>

      <!-- Shared Service Communication -->
      <div class="mt-4">
        <p>Shared Message: {{ sharedService.currentMessage$ | async }}</p>
        <p>Shared Counter: {{ sharedService.currentCounter$ | async }}</p>
        
        <div class="mt-2 space-x-2">
          <button 
            (click)="incrementSharedCounter()"
            class="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Increment Shared
          </button>
          <button 
            (click)="decrementSharedCounter()"
            class="px-3 py-1 bg-red-500 text-white rounded"
          >
            Decrement Shared
          </button>
        </div>

        <!-- Signal-based counter -->
        <div class="mt-4">
          <p>Signal Counter: {{ sharedService.count() }}</p>
          <div class="space-x-2">
            <button 
              (click)="sharedService.incrementCount()"
              class="px-3 py-1 bg-purple-500 text-white rounded"
            >
              Increment Signal
            </button>
            <button 
              (click)="sharedService.decrementCount()"
              class="px-3 py-1 bg-yellow-500 text-white rounded"
            >
              Decrement Signal
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Child2Component {
  @Input() messageFromParent = '';
  @Output() messageToParent = new EventEmitter<string>();

  childMessage = '';

  constructor(public sharedService: SharedService) {}

  updateChildMessage(message: string) {
    this.childMessage = message;
  }

  sendMessageToParent() {
    this.messageToParent.emit(this.childMessage);
  }

  incrementSharedCounter() {
    this.sharedService.currentCounter$.pipe(
      take(1)
    ).subscribe(currentValue => {
      this.sharedService.updateCounter(currentValue + 1);
    });
  }

  decrementSharedCounter() {
    this.sharedService.currentCounter$.pipe(
      take(1)
    ).subscribe(currentValue => {
      this.sharedService.updateCounter(currentValue - 1);
    });
  }
}
