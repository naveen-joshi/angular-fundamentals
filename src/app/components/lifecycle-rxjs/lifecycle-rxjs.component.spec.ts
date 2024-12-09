import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LifecycleRxjsComponent } from './lifecycle-rxjs.component';
import { LifecycleRxjsService } from './lifecycle-rxjs.service';
import { ErrorService } from '../../core/error-handling/error.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('LifecycleRxjsComponent', () => {
  let component: LifecycleRxjsComponent;
  let fixture: ComponentFixture<LifecycleRxjsComponent>;
  let lifecycleService: jasmine.SpyObj<LifecycleRxjsService>;
  let errorService: jasmine.SpyObj<ErrorService>;

  // Mock data
  const mockPosts = [
    { id: 1, title: 'Post 1', body: 'Body 1', userId: 1 },
    { id: 2, title: 'Post 2', body: 'Body 2', userId: 1 }
  ];

  const mockComments = [
    [
      { id: 1, postId: 1, email: 'user1@example.com', body: 'Comment 1' },
      { id: 2, postId: 1, email: 'user2@example.com', body: 'Comment 2' }
    ]
  ];

  const mockTodos = [
    {
      userId: 1,
      todos: [
        { id: 1, userId: 1, title: 'Todo 1', completed: false },
        { id: 2, userId: 1, title: 'Todo 2', completed: true }
      ]
    }
  ];

  const mockPhotos = [
    { id: 1, albumId: 1, title: 'Photo 1', url: 'url1', thumbnailUrl: 'thumb1' },
    { id: 2, albumId: 1, title: 'Photo 2', url: 'url2', thumbnailUrl: 'thumb2' }
  ];

  const mockAlbums = [
    {
      userId: 1,
      albums: [
        { id: 1, userId: 1, title: 'Album 1' },
        { id: 2, userId: 1, title: 'Album 2' }
      ]
    }
  ];

  beforeEach(async () => {
    // Create spy objects for services
    const lifecycleServiceSpy = jasmine.createSpyObj('LifecycleRxjsService', [
      'searchPosts',
      'getComments',
      'getTodosSequentially',
      'getPhotos',
      'getAlbums'
    ]);
    const errorServiceSpy = jasmine.createSpyObj('ErrorService', [
      'showError',
      'showInfo'
    ]);

    await TestBed.configureTestingModule({
      imports: [LifecycleRxjsComponent],
      providers: [
        { provide: LifecycleRxjsService, useValue: lifecycleServiceSpy },
        { provide: ErrorService, useValue: errorServiceSpy }
      ]
    }).compileComponents();

    lifecycleService = TestBed.inject(LifecycleRxjsService) as jasmine.SpyObj<LifecycleRxjsService>;
    errorService = TestBed.inject(ErrorService) as jasmine.SpyObj<ErrorService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LifecycleRxjsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Lifecycle Events Tests
  describe('Lifecycle Events', () => {
    it('should log constructor event', () => {
      expect(component.lifecycleEvents).toContain('constructor');
    });

    it('should log ngOnInit event', () => {
      expect(component.lifecycleEvents).toContain('ngOnInit');
    });

    it('should log ngOnDestroy event', () => {
      component.ngOnDestroy();
      expect(component.lifecycleEvents).toContain('ngOnDestroy');
    });
  });

  // Search Posts Tests
  describe('Search Posts', () => {
    it('should debounce search and update results', fakeAsync(() => {
      lifecycleService.searchPosts.and.returnValue(of(mockPosts));

      // Simulate user typing
      component.searchTerm = 'test';
      component.onSearch({ target: { value: 'test' } } as any);
      
      // Fast-forward debounce time
      tick(300);
      
      expect(lifecycleService.searchPosts).toHaveBeenCalledWith('test');
      expect(component.searchResults).toEqual(mockPosts);
    }));

    it('should handle search error', fakeAsync(() => {
      const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      lifecycleService.searchPosts.and.returnValue(throwError(() => error));

      component.searchTerm = 'test';
      component.onSearch({ target: { value: 'test' } } as any);
      
      tick(300);
      
      expect(errorService.showError).toHaveBeenCalled();
    }));
  });

  // Comments Loading Tests
  describe('Comments Loading', () => {
    it('should load comments successfully', () => {
      lifecycleService.getComments.and.returnValue(of(mockComments));

      component.loadComments();

      expect(component.comments).toEqual(mockComments);
      expect(errorService.showInfo).toHaveBeenCalledWith('Comments loaded successfully');
    });

    it('should handle comments loading error', () => {
      const error = new Error('Failed to load comments');
      lifecycleService.getComments.and.returnValue(throwError(() => error));

      component.loadComments();

      expect(errorService.showError).toHaveBeenCalledWith('Failed to load comments: Failed to load comments');
    });
  });

  // Todos Loading Tests
  describe('Todos Loading', () => {
    it('should load todos sequentially', () => {
      lifecycleService.getTodosSequentially.and.returnValue(of(mockTodos[0]));

      component.loadTodosSequentially();

      expect(component.todos).toContain(mockTodos[0]);
      expect(errorService.showInfo).toHaveBeenCalledWith('Todos loaded successfully');
    });

    it('should handle todos loading error', () => {
      const error = new Error('Failed to load todos');
      lifecycleService.getTodosSequentially.and.returnValue(throwError(() => error));

      component.loadTodosSequentially();

      expect(errorService.showError).toHaveBeenCalledWith('Failed to load todos: Failed to load todos');
    });
  });

  // Photos Loading Tests
  describe('Photos Loading', () => {
    it('should load photos successfully', () => {
      lifecycleService.getPhotos.and.returnValue(of(mockPhotos));

      component.loadPhotos();

      expect(component.photos).toEqual(mockPhotos);
      expect(errorService.showInfo).toHaveBeenCalledWith('Photos loaded successfully');
    });

    it('should handle photos loading error', () => {
      const error = new Error('Failed to load photos');
      lifecycleService.getPhotos.and.returnValue(throwError(() => error));

      component.loadPhotos();

      expect(errorService.showError).toHaveBeenCalledWith('Failed to load photos: Failed to load photos');
    });
  });

  // Albums Loading Tests
  describe('Albums Loading', () => {
    it('should load albums successfully', () => {
      lifecycleService.getAlbums.and.returnValue(of(mockAlbums[0]));

      component.loadAlbums();

      expect(component.albums).toContain(mockAlbums[0]);
      expect(errorService.showInfo).toHaveBeenCalledWith('Albums loaded successfully');
    });

    it('should handle albums loading error', () => {
      const error = new Error('Failed to load albums');
      lifecycleService.getAlbums.and.returnValue(throwError(() => error));

      component.loadAlbums();

      expect(errorService.showError).toHaveBeenCalledWith('Failed to load albums: Failed to load albums');
    });
  });

  // Template Integration Tests
  describe('Template Integration', () => {
    it('should display search results when available', () => {
      component.searchResults = mockPosts;
      fixture.detectChanges();

      const postElements = fixture.nativeElement.querySelectorAll('.bg-white.border.rounded-lg');
      expect(postElements.length).toBe(mockPosts.length);
    });

    it('should display loading spinner when loading', () => {
      component.loading = true;
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('.animate-spin');
      expect(spinner).toBeTruthy();
    });

    it('should display "No search results" message when no results', () => {
      component.searchResults = [];
      fixture.detectChanges();

      const noResultsMessage = fixture.nativeElement.querySelector('.text-center.text-gray-500');
      expect(noResultsMessage.textContent).toContain('No search results found');
    });
  });
});
