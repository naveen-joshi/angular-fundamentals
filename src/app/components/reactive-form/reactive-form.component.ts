import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Custom validator function
function passwordStrengthValidator(control: any) {
  const value = control.value;
  const hasNumber = /[0-9]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasSpecial = /[!@#$%^&*]/.test(value);
  
  const valid = hasNumber && hasUpper && hasLower && hasSpecial;
  
  return valid ? null : {
    passwordStrength: {
      hasNumber,
      hasUpper,
      hasLower,
      hasSpecial
    }
  };
}

@Component({
  selector: 'app-reactive-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-4 max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4">Reactive Form Demo</h2>
      
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Name Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input 
            type="text" 
            formControlName="name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [ngClass]="{'border-red-500': userForm.get('name')?.errors && userForm.get('name')?.touched}"
          >
          <div *ngIf="userForm.get('name')?.errors?.['required'] && userForm.get('name')?.touched" 
               class="text-red-500 text-sm mt-1">
            Name is required
          </div>
          <div *ngIf="userForm.get('name')?.errors?.['minlength'] && userForm.get('name')?.touched" 
               class="text-red-500 text-sm mt-1">
            Name must be at least 3 characters
          </div>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            formControlName="email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [ngClass]="{'border-red-500': userForm.get('email')?.errors && userForm.get('email')?.touched}"
          >
          <div *ngIf="userForm.get('email')?.errors?.['required'] && userForm.get('email')?.touched" 
               class="text-red-500 text-sm mt-1">
            Email is required
          </div>
          <div *ngIf="userForm.get('email')?.errors?.['email'] && userForm.get('email')?.touched" 
               class="text-red-500 text-sm mt-1">
            Please enter a valid email
          </div>
        </div>

        <!-- Password Field with Custom Validation -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            formControlName="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [ngClass]="{'border-red-500': userForm.get('password')?.errors && userForm.get('password')?.touched}"
          >
          <div *ngIf="userForm.get('password')?.errors?.['required'] && userForm.get('password')?.touched" 
               class="text-red-500 text-sm mt-1">
            Password is required
          </div>
          <div *ngIf="userForm.get('password')?.errors?.['passwordStrength'] && userForm.get('password')?.touched" 
               class="text-red-500 text-sm mt-1">
            Password must contain:
            <ul class="list-disc list-inside">
              <li *ngIf="!userForm.get('password')?.errors?.['passwordStrength'].hasNumber">A number</li>
              <li *ngIf="!userForm.get('password')?.errors?.['passwordStrength'].hasUpper">An uppercase letter</li>
              <li *ngIf="!userForm.get('password')?.errors?.['passwordStrength'].hasLower">A lowercase letter</li>
              <li *ngIf="!userForm.get('password')?.errors?.['passwordStrength'].hasSpecial">A special character</li>
            </ul>
          </div>
        </div>

        <!-- Age Field with Number Only Directive -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Age</label>
          <input 
            type="text" 
            formControlName="age"
            appNumberOnly
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            [ngClass]="{'border-red-500': userForm.get('age')?.errors && userForm.get('age')?.touched}"
          >
          <div *ngIf="userForm.get('age')?.errors?.['required'] && userForm.get('age')?.touched" 
               class="text-red-500 text-sm mt-1">
            Age is required
          </div>
          <div *ngIf="userForm.get('age')?.errors?.['min'] && userForm.get('age')?.touched" 
               class="text-red-500 text-sm mt-1">
            Age must be at least 18
          </div>
          <div *ngIf="userForm.get('age')?.errors?.['max'] && userForm.get('age')?.touched" 
               class="text-red-500 text-sm mt-1">
            Age must be less than 100
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          [disabled]="!userForm.valid"
          class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Submit
        </button>
      </form>

      <!-- Form Debug Info -->
      <div class="mt-4 p-4 bg-gray-100 rounded">
        <h3 class="text-lg font-semibold">Form State:</h3>
        <pre class="mt-2 text-sm">{{ userForm.value | json }}</pre>
        <div class="mt-2">
          <p>Form Valid: {{ userForm.valid }}</p>
          <p>Form Touched: {{ userForm.touched }}</p>
          <p>Form Dirty: {{ userForm.dirty }}</p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReactiveFormComponent {
  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log('Form submitted:', this.userForm.value);
      // Handle form submission
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
