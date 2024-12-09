import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ErrorMessagesComponent } from './core/error-handling/error-messages.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ErrorMessagesComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Navigation -->
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <h1 class="text-xl font-bold text-gray-800">Angular Features Demo</h1>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a 
                  *ngFor="let link of navLinks"
                  [routerLink]="link.path"
                  routerLinkActive="text-indigo-600 border-indigo-500"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  {{ link.label }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Error Messages -->
      <app-error-messages></app-error-messages>
    </div>
  `
})
export class AppComponent {
  navLinks = [
    { path: '/communication', label: 'Component Communication' },
    { path: '/signals', label: 'Signals Demo' },
    { path: '/reactive-form', label: 'Reactive Form' },
    { path: '/template-form', label: 'Template Form' },
    { path: '/lifecycle-rxjs', label: 'Angular Lifecycles' },
  ];
}
