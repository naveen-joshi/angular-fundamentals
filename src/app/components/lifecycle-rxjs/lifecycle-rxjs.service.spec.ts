import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LifecycleRxjsService } from './lifecycle-rxjs.service';
import { skip, take } from 'rxjs/operators';

describe('LifecycleRxjsService', () => {
  let service: LifecycleRxjsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://jsonplaceholder.typicode.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LifecycleRxjsService]
    });
    service = TestBed.inject(LifecycleRxjsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const mockPost = {
    userId: 1,
    id: 1,
    title: 'test post',
    body: 'test body'
  };

  const mockUser = {
    id: 1,
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com'
  };

  describe('searchPosts', () => {
    it('should filter posts based on search term', (done) => {
      const mockPosts = [
        { ...mockPost },
        { ...mockPost, id: 2, title: 'another post' }
      ];

      service.searchPosts('test').subscribe(posts => {
        expect(posts.length).toBe(1);
        expect(posts[0].title).toContain('test');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/posts`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPosts);
    });

    it('should handle errors when searching posts', (done) => {
      service.searchPosts('test').subscribe({
        error: (error) => {
          expect(error).toBe('Failed to fetch posts');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/posts`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getPostWithUser', () => {
    it('should combine post and user details', (done) => {
      service.getPostWithUser(1).subscribe(result => {
        expect(result.post).toEqual(mockPost);
        expect(result.user).toEqual(mockUser);
        done();
      });

      const postReq = httpMock.expectOne(`${baseUrl}/posts/1`);
      postReq.flush(mockPost);

      const userReq = httpMock.expectOne(`${baseUrl}/users/1`);
      userReq.flush(mockUser);
    });
  });

  describe('getPostsAndUsers', () => {
    it('should fetch both posts and users', (done) => {
      const mockPosts = [mockPost];
      const mockUsers = [mockUser];

      service.getPostsAndUsers().subscribe(result => {
        expect(result.posts).toEqual(mockPosts);
        expect(result.users).toEqual(mockUsers);
        done();
      });

      const postsReq = httpMock.expectOne(`${baseUrl}/posts`);
      postsReq.flush(mockPosts);

      const usersReq = httpMock.expectOne(`${baseUrl}/users`);
      usersReq.flush(mockUsers);
    });
  });

  describe('getSharedCounter', () => {
    it('should emit 5 values and complete', (done) => {
      const emittedValues: number[] = [];

      service.getSharedCounter().subscribe({
        next: (value) => emittedValues.push(value),
        complete: () => {
          expect(emittedValues.length).toBe(5);
          expect(emittedValues).toEqual([0, 1, 2, 3, 4]);
          done();
        }
      });
    });

    it('should share the same counter between multiple subscribers', (done) => {
      const values1: number[] = [];
      const values2: number[] = [];

      service.getSharedCounter().pipe(take(2)).subscribe(val => values1.push(val));
      
      // Skip first value for second subscriber to verify sharing
      service.getSharedCounter().pipe(skip(1), take(2)).subscribe({
        next: val => values2.push(val),
        complete: () => {
          expect(values1).toEqual([0, 1]);
          expect(values2).toEqual([1, 2]);
          done();
        }
      });
    });
  });

  describe('getPostComments', () => {
    it('should fetch comments for multiple posts', (done) => {
      const mockComments = [
        { postId: 1, id: 1, body: 'comment 1' },
        { postId: 2, id: 2, body: 'comment 2' }
      ];

      service.getPostComments([1, 2]).subscribe(comments => {
        expect(comments.length).toBe(2);
        done();
      });

      const req1 = httpMock.expectOne(`${baseUrl}/posts/1/comments`);
      const req2 = httpMock.expectOne(`${baseUrl}/posts/2/comments`);
      
      req1.flush(mockComments);
      req2.flush(mockComments);
    });
  });

  describe('getTodosSequentially', () => {
    it('should fetch todos for users sequentially', (done) => {
      const mockTodos = [
        { userId: 1, id: 1, title: 'todo 1', completed: false },
        { userId: 1, id: 2, title: 'todo 2', completed: true }
      ];

      service.getTodosSequentially([1, 2]).subscribe(result => {
        expect(result.userId).toBe(1);
        expect(result.todos.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/users/1/todos`);
      req.flush(mockTodos);
    });
  });

  describe('getPhotos', () => {
    it('should fetch photos for an album', (done) => {
      const mockPhotos = [
        { albumId: 1, id: 1, title: 'photo 1', url: 'url1', thumbnailUrl: 'thumb1' },
        { albumId: 1, id: 2, title: 'photo 2', url: 'url2', thumbnailUrl: 'thumb2' }
      ];

      service.getPhotos(1).subscribe(photos => {
        expect(photos.length).toBe(2);
        expect(photos[0].albumId).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/albums/1/photos`);
      req.flush(mockPhotos);
    });
  });

  describe('getAlbums', () => {
    it('should fetch albums for multiple users with concurrent limit', (done) => {
      const mockAlbums = [
        { userId: 1, id: 1, title: 'album 1' },
        { userId: 1, id: 2, title: 'album 2' }
      ];

      service.getAlbums([1, 2, 3, 4]).subscribe(result => {
        expect(result.userId).toBe(1);
        expect(result.albums.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/users/1/albums`);
      req.flush(mockAlbums);
    });
  });

  describe('getComments', () => {
    it('should fetch comments successfully', (done) => {
      const mockComments = [
        { id: 1, postId: 1, body: 'comment 1' },
        { id: 2, postId: 1, body: 'comment 2' }
      ];

      service.getComments().subscribe(comments => {
        expect(comments).toEqual(mockComments);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/comments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockComments);
    });

    it('should handle errors when fetching comments', (done) => {
      service.getComments().subscribe({
        error: (error) => {
          expect(error).toBe('Failed to fetch comments');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/comments`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
