import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../service/shared.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-child1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 border rounded-lg bg-blue-50">
      <h3 class="text-lg font-semibold">Child 1</h3>
      
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
          class="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Send to Parent
        </button>
      </div>

      <!-- Shared Service Communication -->
      <div class="mt-4">
        <input 
          #sharedInput
          type="text" 
          [value]="sharedService.currentMessage$ | async"
          (input)="updateSharedMessage(sharedInput.value)"
          class="px-3 py-1 border rounded"
          placeholder="Update shared message..."
        >
        <div class="mt-2 space-x-2">
          <button 
            (click)="incrementSharedCounter()"
            class="px-3 py-1 bg-green-500 text-white rounded"
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
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Child1Component {
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

  updateSharedMessage(message: string) {
    this.sharedService.updateMessage(message);
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
