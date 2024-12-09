import { Component, OnInit, OnDestroy, OnChanges, AfterViewInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, forkJoin, combineLatest, mergeMap, concatMap, exhaustMap, share } from 'rxjs';
import { LifecycleRxjsService } from './lifecycle-rxjs.service';
import { ErrorService } from '../../core/error-handling/error.service';

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

@Component({
  selector: 'app-lifecycle-rxjs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6 bg-gray-50">
      <h2 class="text-3xl font-bold text-gray-800 mb-8">RxJS Operators Demo</h2>
      
      <!-- Lifecycle Events Section -->
      <div class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold text-gray-700 mb-4">Lifecycle Events Log</h3>
        <div class="border rounded-lg bg-gray-50 p-4">
          @if (lifecycleEvents.length) {
            <ul class="space-y-2">
              @for (event of lifecycleEvents; track event) {
                <li class="text-gray-600 font-mono text-sm">{{ event }}</li>
              }
            </ul>
          } @else {
            <p class="text-gray-500 italic">No lifecycle events recorded yet.</p>
          }
        </div>
      </div>

      <!-- Search Posts Section -->
      <div class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold text-gray-700 mb-4">Search Posts</h3>
        <div class="mb-4">
          <input 
            type="text" 
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            [(ngModel)]="searchTerm"
            placeholder="Search posts..."
            (input)="onSearch($event)"
          >
        </div>
        
        <div class="mt-4">
          @if (loading) {
            <div class="flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          } @else {
            @if (searchResults.length) {
              @for (post of searchResults; track post.id) {
                <div class="bg-white border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
                  <h4 class="text-lg font-semibold text-gray-800 mb-2">{{ post.title }}</h4>
                  <p class="text-gray-600">{{ post.body }}</p>
                </div>
              }
            } @else {
              <p class="text-center text-gray-500 italic">No search results found.</p>
            }
          }
        </div>
      </div>

      <!-- Comments Section (mergeMap) -->
      @defer (on interaction) {
        <div class="mb-8 bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-700">Post Comments: Merge Map</h3>
            <button 
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              (click)="loadComments()"
            >
              <span>Load Comments</span>
            </button>
          </div>
          @if (comments.length) {
            @for (postComments of comments; track $index) {
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-2">Comments for Post {{ $index + 1 }}</h4>
                @for (comment of postComments; track comment.id) {
                  <div class="bg-white rounded-lg p-4 mb-2 shadow-sm">
                    <div class="font-medium text-indigo-600 mb-1">{{ comment.email }}</div>
                    <p class="text-gray-600">{{ comment.body }}</p>
                  </div>
                }
              </div>
            }
          } @else {
            <p class="text-center text-gray-500 italic">No comments loaded yet.</p>
          }
        </div>
      } @placeholder {
        <div class="mb-8 bg-white rounded-lg shadow-md p-6 text-center">
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Post Comments</h3>
          <p class="text-gray-500">Interact with this section to load comments</p>
        </div>
      }

      <!-- Todos Section (concatMap) -->
      @defer (on viewport) {
        <div class="mb-8 bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-700">Sequential Todos Loading: Concat Map</h3>
            <button 
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              (click)="loadTodosSequentially()"
            >
              <span>Load Todos</span>
            </button>
          </div>
          @if (todos.length) {
            @for (userTodos of todos; track userTodos.userId) {
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-2">Todos for User {{ userTodos.userId }}</h4>
                @for (todo of userTodos.todos; track todo.id) {
                  <div class="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded">
                    <input 
                      type="checkbox" 
                      [checked]="todo.completed" 
                      disabled
                      class="h-4 w-4 text-indigo-600 rounded"
                    >
                    <span [class]="todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'">
                      {{ todo.title }}
                    </span>
                  </div>
                }
              </div>
            }
          } @else {
            <p class="text-center text-gray-500 italic">Click to load todos</p>
          }
        </div>
      } @loading {
        <div class="mb-8 bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-center items-center h-32">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        </div>
      } @placeholder {
        <div class="mb-8 bg-white rounded-lg shadow-md p-6 text-center">
          <h3 class="text-xl font-semibold text-gray-700 mb-2">User Todos</h3>
          <p class="text-gray-500">Scroll down to load todos</p>
        </div>
      }

      <!-- Photos Section (exhaustMap) -->
      @defer (when photos.length > 0) {
        <div class="mb-8 bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-700">Album Photos: Exhaust Map</h3>
            <button 
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              (click)="loadPhotos()"
            >
              <span>Load Photos</span>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (photo of photos; track photo.id) {
              <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img 
                  [src]="photo.thumbnailUrl" 
                  [alt]="photo.title"
                  class="w-full h-48 object-cover"
                >
                <div class="p-4">
                  <p class="text-gray-600 text-sm line-clamp-2">{{ photo.title }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      } @loading (minimum 1s) {
        <div class="mb-8 bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-center items-center h-32">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </div>
      } @error {
        <div class="mb-8 bg-white rounded-lg shadow-md p-6">
          <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p class="font-semibold">Error loading photos</p>
            <p>Please try again later</p>
          </div>
        </div>
      }

      <!-- Albums Section (mergeMap with concurrent limit) -->
      @defer (on idle) {
        <div class="mb-8 bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-700">User Albums</h3>
            <button 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              (click)="loadAlbums()"
            >
              <span>Load Albums</span>
            </button>
          </div>
          @if (albums.length) {
            @for (userAlbums of albums; track userAlbums.userId) {
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 class="text-lg font-semibold text-gray-800 mb-2">Albums for User {{ userAlbums.userId }}</h4>
                @for (album of userAlbums.albums; track album.id) {
                  <div class="bg-white p-3 rounded-lg mb-2 shadow-sm hover:shadow-md transition-shadow">
                    <p class="text-gray-700">{{ album.title }}</p>
                  </div>
                }
              </div>
            }
          } @else {
            <p class="text-center text-gray-500 italic">Click to load albums</p>
          }
        </div>
      } @placeholder {
        <div class="mb-8 bg-white rounded-lg shadow-md p-6 text-center">
          <h3 class="text-xl font-semibold text-gray-700 mb-2">User Albums</h3>
          <p class="text-gray-500">This section will load when the browser is idle</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
    }
    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
    }
    .border {
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }
    .bg-light {
      background-color: #f8f9fa;
    }
    .btn {
      margin-right: 8px;
    }
    .completed {
      text-decoration: line-through;
      color: #6c757d;
    }
    .todo-item {
      margin: 8px 0;
    }
    .comment-item {
      margin: 12px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid #dee2e6;
    }
    .album-item {
      padding: 8px;
      border-bottom: 1px solid #dee2e6;
    }
  `]
})
export class LifecycleRxjsComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  searchResults: Post[] = [];
  lifecycleEvents: string[] = [];
  loading: boolean = false;
  postWithUser?: { post: Post; user: User };
  postsAndUsers?: { posts: Post[]; users: User[] };
  counterValue: number = 0;
  comments: any[][] = [];
  todos: any[] = [];
  photos: any[] = [];
  albums: any[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  public lifecycleService = inject(LifecycleRxjsService);
  private errorService = inject(ErrorService);
  
  constructor() {
    this.logLifecycleEvent('constructor');
  }

  ngOnInit(): void {
    this.logLifecycleEvent('ngOnInit');
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.logLifecycleEvent('ngOnDestroy');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.loading = true;
        return this.lifecycleService.searchPosts(term);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.loading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  loadPostWithUser(): void {
    const randomPostId = Math.floor(Math.random() * 10) + 1;
    this.lifecycleService.getPostWithUser(randomPostId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => this.postWithUser = result,
        error: (error) => console.error('Error loading post with user:', error)
      });
  }

  loadPostsAndUsers(): void {
    this.lifecycleService.getPostsAndUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => this.postsAndUsers = result,
        error: (error) => console.error('Error loading posts and users:', error)
      });
  }

  startSharedCounter(): void {
    this.lifecycleService.getSharedCounter()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value) => this.counterValue = value,
        error: (error) => console.error('Counter error:', error)
      });
  }

  loadComments(): void {
    const postIds = [1, 2, 3]; // Example post IDs
    this.lifecycleService.getPostComments(postIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comments) => {
          this.comments = comments;
          this.errorService.showInfo('Comments loaded successfully');
        },
        error: (error) => {
          this.errorService.showError('Failed to load comments: ' + error.message);
        }
      });
  }

  loadTodosSequentially(): void {
    const userIds = [1, 2, 3]; // Example user IDs
    this.lifecycleService.getTodosSequentially(userIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userTodos) => {
          this.todos.push(userTodos);
          this.errorService.showInfo('Todos loaded successfully');
        },
        error: (error) => {
          this.errorService.showError('Failed to load todos: ' + error.message);
        }
      });
  }

  loadPhotos(): void {
    const albumId = Math.floor(Math.random() * 5) + 1;
    this.lifecycleService.getPhotos(albumId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (photos) => {
          this.photos = photos;
          this.errorService.showInfo('Photos loaded successfully');
        },
        error: (error) => {
          this.errorService.showError('Failed to load photos: ' + error.message);
        }
      });
  }

  loadAlbums(): void {
    const userIds = [1, 2, 3, 4, 5]; // Example user IDs
    this.lifecycleService.getAlbums(userIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userAlbums) => {
          this.albums.push(userAlbums);
          this.errorService.showInfo('Albums loaded successfully');
        },
        error: (error) => {
          this.errorService.showError('Failed to load albums: ' + error.message);
        }
      });
  }

  private logLifecycleEvent(event: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.lifecycleEvents.unshift(`${timestamp}: ${event}`);
  }

  trackPost(index: number, post: Post): number {
    return post.id;
  }

  trackPostComments(index: number, postComments: any[]): number {
    return index;
  }

  trackComment(index: number, comment: any): number {
    return comment.id;
  }

  trackUserTodos(index: number, userTodos: any): number {
    return userTodos.userId;
  }

  trackTodo(index: number, todo: any): number {
    return todo.id;
  }

  trackPhoto(index: number, photo: any): number {
    return photo.id;
  }

  trackUserAlbums(index: number, userAlbums: any): number {
    return userAlbums.userId;
  }

  trackAlbum(index: number, album: any): number {
    return album.id;
  }
}
