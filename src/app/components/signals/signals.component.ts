import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../service/shared.service';

@Component({
  selector: 'app-signals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 space-y-4">
      <h2 class="text-2xl font-bold">Signals Demo</h2>
      
      <!-- Local Signals -->
      <div class="space-y-2">
        <h3 class="text-xl">Local Counter: {{ counter() }}</h3>
        <div class="space-x-2">
          <button (click)="increment()" class="px-4 py-2 bg-blue-500 text-white rounded">Increment</button>
          <button (click)="decrement()" class="px-4 py-2 bg-red-500 text-white rounded">Decrement</button>
        </div>
        <p>Double value: {{ doubleCount() }}</p>
      </div>

      <!-- Shared Service Signals -->
      <div class="mt-4 space-y-2">
        <h3 class="text-xl">Shared Counter: {{ sharedService.count() }}</h3>
        <div class="space-x-2">
          <button (click)="sharedService.incrementCount()" class="px-4 py-2 bg-green-500 text-white rounded">
            Increment Shared
          </button>
          <button (click)="sharedService.decrementCount()" class="px-4 py-2 bg-yellow-500 text-white rounded">
            Decrement Shared
          </button>
        </div>
      </div>

      <!-- Message Input -->
      <div class="mt-4">
        <input 
          #messageInput
          type="text" 
          [value]="sharedService.message()"
          (input)="updateMessage(messageInput.value)"
          class="px-4 py-2 border rounded"
          placeholder="Type a message..."
        >
        <p class="mt-2">Current message: {{ sharedService.message() }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalsComponent {
  // Local signals
  counter = signal(0);
  doubleCount = computed(() => this.counter() * 2);

  constructor(public sharedService: SharedService) {
    // Effect to log changes
    effect(() => {
      console.log('Counter changed:', this.counter());
      console.log('Shared counter changed:', this.sharedService.count());
    });
  }

  increment() {
    this.counter.update(value => value + 1);
  }

  decrement() {
    this.counter.update(value => value - 1);
  }

  updateMessage(message: string) {
    this.sharedService.updateSignalMessage(message);
  }
}
