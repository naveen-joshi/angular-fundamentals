import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Child1Component } from '../child1/child1.component';
import { Child2Component } from '../child2/child2.component';
import { SharedService } from '../../service/shared.service';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [CommonModule, Child1Component, Child2Component],
  template: `
    <div class="p-4 space-y-4">
      <h2 class="text-2xl font-bold">Component Communication Demo</h2>

      <!-- Parent to Child Communication -->
      <div class="space-y-2">
        <h3 class="text-xl">Parent Component</h3>
        <input 
          #messageInput
          type="text" 
          [value]="parentMessage"
          (input)="updateParentMessage(messageInput.value)"
          class="px-4 py-2 border rounded"
          placeholder="Type a message for children..."
        >
        <p>Current parent message: {{ parentMessage }}</p>
      </div>

      <!-- Child Components -->
      <div class="grid grid-cols-2 gap-4 mt-4">
        <app-child1 
          [messageFromParent]="parentMessage"
          (messageToParent)="handleChild1Message($event)"
        ></app-child1>

        <app-child2 
          [messageFromParent]="parentMessage"
          (messageToParent)="handleChild2Message($event)"
        ></app-child2>
      </div>

      <!-- Messages received from children -->
      <div class="mt-4 space-y-2">
        <h3 class="text-xl">Messages from Children</h3>
        <p>From Child 1: {{ messageFromChild1 }}</p>
        <p>From Child 2: {{ messageFromChild2 }}</p>
      </div>

      <!-- Shared Service Messages -->
      <div class="mt-4 space-y-2">
        <h3 class="text-xl">Shared Service Communication</h3>
        <p>Current shared message: {{ sharedService.currentMessage$ | async }}</p>
        <p>Shared counter: {{ sharedService.currentCounter$ | async }}</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParentComponent {
  parentMessage = 'Hello from Parent';
  messageFromChild1 = '';
  messageFromChild2 = '';

  constructor(public sharedService: SharedService) {}

  updateParentMessage(message: string) {
    this.parentMessage = message;
  }

  handleChild1Message(message: string) {
    this.messageFromChild1 = message;
  }

  handleChild2Message(message: string) {
    this.messageFromChild2 = message;
  }
}
