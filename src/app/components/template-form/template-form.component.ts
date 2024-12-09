import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NumberOnlyDirective } from '../../directives/number-only.directive';

interface UserForm {
  name: string;
  email: string;
  phone: string;
  age: number;
  message: string;
}

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NumberOnlyDirective],
  template: `
    <div class="p-4 max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4">Template-Driven Form Demo</h2>
      
      <form #userForm="ngForm" (ngSubmit)="onSubmit(userForm)" class="space-y-4">
        <!-- Name Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input 
            type="text" 
            name="name"
            [(ngModel)]="model.name"
            #name="ngModel"
            required
            minlength="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [ngClass]="{'border-red-500': name.errors && (name.dirty || name.touched)}"
          >
          <div *ngIf="name.errors?.['required'] && (name.dirty || name.touched)" 
               class="text-red-500 text-sm mt-1">
            Name is required
          </div>
          <div *ngIf="name.errors?.['minlength'] && (name.dirty || name.touched)" 
               class="text-red-500 text-sm mt-1">
            Name must be at least 3 characters
          </div>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            name="email"
            [(ngModel)]="model.email"
            #email="ngModel"
            required
            email
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [ngClass]="{'border-red-500': email.errors && (email.dirty || email.touched)}"
          >
          <div *ngIf="email.errors?.['required'] && (email.dirty || email.touched)" 
               class="text-red-500 text-sm mt-1">
            Email is required
          </div>
          <div *ngIf="email.errors?.['email'] && (email.dirty || email.touched)" 
               class="text-red-500 text-sm mt-1">
            Please enter a valid email
          </div>
        </div>

        <!-- Phone Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Phone</label>
          <input 
            type="text" 
            name="phone"
            [(ngModel)]="model.phone"
            #phone="ngModel"
            required
            pattern="[0-9]{10}"
            appNumberOnly
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [ngClass]="{'border-red-500': phone.errors && (phone.dirty || phone.touched)}"
          >
          <div *ngIf="phone.errors?.['required'] && (phone.dirty || phone.touched)" 
               class="text-red-500 text-sm mt-1">
            Phone is required
          </div>
          <div *ngIf="phone.errors?.['pattern'] && (phone.dirty || phone.touched)" 
               class="text-red-500 text-sm mt-1">
            Please enter a valid 10-digit phone number
          </div>
        </div>

        <!-- Age Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Age</label>
          <input 
            type="text" 
            name="age"
            [(ngModel)]="model.age"
            #age="ngModel"
            required
            min="18"
            max="100"
            appNumberOnly
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [ngClass]="{'border-red-500': age.errors && (age.dirty || age.touched)}"
          >
          <div *ngIf="age.errors?.['required'] && (age.dirty || age.touched)" 
               class="text-red-500 text-sm mt-1">
            Age is required
          </div>
          <div *ngIf="age.errors?.['min'] && (age.dirty || age.touched)" 
               class="text-red-500 text-sm mt-1">
            Age must be at least 18
          </div>
          <div *ngIf="age.errors?.['max'] && (age.dirty || age.touched)" 
               class="text-red-500 text-sm mt-1">
            Age must be less than 100
          </div>
        </div>

        <!-- Message Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Message</label>
          <textarea 
            name="message"
            [(ngModel)]="model.message"
            #message="ngModel"
            required
            minlength="10"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [ngClass]="{'border-red-500': message.errors && (message.dirty || message.touched)}"
          ></textarea>
          <div *ngIf="message.errors?.['required'] && (message.dirty || message.touched)" 
               class="text-red-500 text-sm mt-1">
            Message is required
          </div>
          <div *ngIf="message.errors?.['minlength'] && (message.dirty || message.touched)" 
               class="text-red-500 text-sm mt-1">
            Message must be at least 10 characters
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          [disabled]="!userForm.form.valid"
          class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Submit
        </button>
      </form>

      <!-- Form Debug Info -->
      <div class="mt-4 p-4 bg-gray-100 rounded">
        <h3 class="text-lg font-semibold">Form State:</h3>
        <pre class="mt-2 text-sm">{{ model | json }}</pre>
        <div class="mt-2">
          <p>Form Valid: {{ userForm.form.valid }}</p>
          <p>Form Touched: {{ userForm.form.touched }}</p>
          <p>Form Dirty: {{ userForm.form.dirty }}</p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateFormComponent {
  model: UserForm = {
    name: '',
    email: '',
    phone: '',
    age: 0,
    message: ''
  };

  onSubmit(form: any) {
    if (form.valid) {
      console.log('Form submitted:', this.model);
      // Handle form submission
    }
  }
}
