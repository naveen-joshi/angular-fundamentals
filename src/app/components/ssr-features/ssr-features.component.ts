import { Component, inject, PLATFORM_ID, Inject, ElementRef, ViewChild, AfterViewInit, OnDestroy, afterRender, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';

interface Post {
  id: number;
  title: string;
  body: string;
}

@Component({
  selector: 'app-ssr-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ssr-features">
      <h1>Angular SSR Features Demo</h1>
      
      <!-- Server-side rendered content -->
      <section class="server-content">
        <h2>Server-Side Rendered Content</h2>
        <p>This content is rendered on the server first.</p>
        @if (posts$ | async; as posts) {
          <div class="posts-grid">
            @for (post of posts; track post.id) {
              <div class="post-card">
                <h3>{{ post.title }}</h3>
                <p>{{ post.body }}</p>
              </div>
            }
          </div>
        }
      </section>

      <!-- DOM API Examples -->
      <section class="dom-examples">
        <h2>DOM API Examples</h2>
        <div #domContainer class="dom-container">
          <button (click)="handleClick()">Click me!</button>
          <div #scrollElement class="scroll-element">
            <p>Scroll position: {{ scrollPosition }}</p>
            <div class="scroll-content">
              @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
                <p>Scroll content {{ i }}</p>
              }
            </div>
          </div>
          @if (windowWidth) {
            <p>Window width: {{ windowWidth }}px</p>
          }
          @if (isVisible) {
            <div class="intersection-demo">
              <p>This element is visible!</p>
            </div>
          }
        </div>
      </section>

      <!-- Deferred content example -->
      <section class="deferred-content">
        <h2>Viewport Content</h2>
        @if (deferredData$ | async; as data) {
          <div class="data-card">
            <h3>{{ data.title }}</h3>
            <p>{{ data.content }}</p>
          </div>
        }
      </section>

      <!-- Interactive content with interaction -->
      @defer (on interaction) {
        <section class="interactive-content">
          <h2>Interactive Content (Click to Load)</h2>
          <div class="interactive-card">
            <p>This content was loaded after user interaction!</p>
            @if (interactiveData$ | async; as data) {
              <ul>
                @for (item of data; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            }
          </div>
        </section>
      } @placeholder {
        <button class="load-more-btn">Click to Load More Content</button>
      }

      <!-- Prefetched content -->
      <section class="prefetched-content">
        <h2>Prefetched Content</h2>
        <p>This content is prefetched for better performance!</p>
      </section>
    </div>
  `,
  styles: [`
    .ssr-features {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 2rem;
    }

    section {
      margin-bottom: 3rem;
      padding: 1.5rem;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .post-card {
      padding: 1rem;
      border-radius: 6px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;

      h3 {
        color: #495057;
        margin-bottom: 0.5rem;
      }

      p {
        color: #6c757d;
        font-size: 0.9rem;
      }
    }

    .loading-skeleton {
      padding: 1rem;

      .skeleton-header {
        height: 2rem;
        background: #e9ecef;
        margin-bottom: 1rem;
        border-radius: 4px;
      }

      .skeleton-text {
        height: 1rem;
        background: #e9ecef;
        margin-bottom: 0.5rem;
        border-radius: 4px;
        width: 90%;

        &:last-child {
          width: 75%;
        }
      }
    }

    .load-more-btn {
      width: 100%;
      padding: 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s ease;

      &:hover {
        background: #0056b3;
      }
    }

    .interactive-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;

      ul {
        list-style: none;
        padding: 0;
        margin: 1rem 0;

        li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #e9ecef;
          
          &:last-child {
            border-bottom: none;
          }
        }
      }
    }

    .data-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      
      h3 {
        color: #495057;
        margin-bottom: 0.5rem;
      }

      p {
        color: #6c757d;
      }
    }

    .dom-container {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .scroll-element {
      height: 200px;
      overflow-y: auto;
      border: 1px solid #dee2e6;
      padding: 1rem;
      margin: 1rem 0;
      background: white;
    }

    .scroll-content {
      padding: 1rem;
    }

    .intersection-demo {
      padding: 1rem;
      background: #e9ecef;
      border-radius: 4px;
      margin: 1rem 0;
      text-align: center;
    }

    button {
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 1rem 0;

      &:hover {
        background: #0056b3;
      }
    }
  `]
})
export class SsrFeaturesComponent implements AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  
  @ViewChild('scrollElement') scrollElement?: ElementRef;
  @ViewChild('domContainer') domContainer?: ElementRef;

  posts$ = this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts').pipe(
    delay(500) // Simulate network delay
  );
  
  deferredData$ = of({
    title: 'Deferred Content Example',
    content: 'This content was loaded lazily when it came into viewport!'
  }).pipe(delay(1000));
  
  interactiveData$ = of([
    'Interactive Item 1',
    'Interactive Item 2',
    'Interactive Item 3',
    'Interactive Item 4'
  ]).pipe(delay(800));

  scrollPosition = 0;
  windowWidth?: number;
  isVisible = false;
  renderCount = 0;
  afterRenderCount = 0;
  private observer?: IntersectionObserver;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // Initialize window width only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.windowWidth = window.innerWidth;
      this.setupWindowResize();
    }

    // afterRender hook - runs after every render
    afterRender(() => {
      this.afterRenderCount++;
      console.log(`Component rendered ${this.afterRenderCount} times`);
      
      // Safe to access DOM here
      if (isPlatformBrowser(this.platformId)) {
        const domElements = document.querySelectorAll('.post-card');
        console.log(`Number of post cards rendered: ${domElements.length}`);
      }
    });

    // afterNextRender hook - runs only once after the next render
    afterNextRender(() => {
      console.log('Component rendered for the first time');
      
      // Perform one-time initialization that requires DOM
      if (isPlatformBrowser(this.platformId)) {
        // Example: Initialize third-party library
        console.log('Initializing third-party libraries...');
        this.initializeThirdPartyLibraries();
      }
    });
  }

  private initializeThirdPartyLibraries() {
    // Simulate third-party library initialization
    console.log('Third-party libraries initialized');
  }

  // Track render performance
  private logRenderPerformance() {
    if (isPlatformBrowser(this.platformId)) {
      const timing = window.performance.timing;
      const renderTime = timing.domComplete - timing.domLoading;
      console.log(`Page render time: ${renderTime}ms`);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupScrollListener();
      this.setupIntersectionObserver();
      this.logRenderPerformance();
    }
  }

  private setupWindowResize() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', () => {
        this.windowWidth = window.innerWidth;
        this.renderCount++;
      });
    }
  }

  private setupScrollListener() {
    if (this.scrollElement) {
      this.scrollElement.nativeElement.addEventListener('scroll', () => {
        this.scrollPosition = this.scrollElement?.nativeElement.scrollTop || 0;
      });
    }
  }

  private setupIntersectionObserver() {
    if (this.domContainer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          this.isVisible = entries[0].isIntersecting;
        },
        { threshold: 0.5 }
      );
      this.observer.observe(this.domContainer.nativeElement);
    }
  }

  handleClick() {
    if (isPlatformBrowser(this.platformId)) {
      alert('Button clicked in browser environment!');
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      // Cleanup
      window.removeEventListener('resize', () => {});
      this.observer?.disconnect();
    }
  }
}
