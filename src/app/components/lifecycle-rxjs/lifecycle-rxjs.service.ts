import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, forkJoin, from, interval, of, throwError } from 'rxjs';
import { catchError, delay, map, mergeMap, retry, share, switchMap, take, tap, toArray, concatMap, exhaustMap } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class LifecycleRxjsService {
  private baseUrl = 'https://jsonplaceholder.typicode.com';
  
  // Shared Observable demonstration
  private sharedCounter$ = interval(1000).pipe(
    take(5),
    share()
  );

  constructor(private http: HttpClient) {}

  // Using switchMap to search posts
  searchPosts(term: string): Observable<Post[]> {
    return of(term).pipe(
      tap(searchTerm => console.log('Searching for:', searchTerm)),
      switchMap(searchTerm => 
        this.http.get<Post[]>(`${this.baseUrl}/posts`).pipe(
          map(posts => posts
            .filter(post => 
              post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              post.body.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .slice(0, 5) // Take only first 5 matching posts
          ),
          retry(2),
          catchError(error => {
            console.error('Error fetching posts:', error);
            return throwError(() => 'Failed to fetch posts');
          })
        )
      )
    );
  }

  // Using forkJoin to get post with user details
  getPostWithUser(postId: number): Observable<{ post: Post; user: User }> {
    const post$ = this.http.get<Post>(`${this.baseUrl}/posts/${postId}`);
    return post$.pipe(
      switchMap(post => {
        const user$ = this.http.get<User>(`${this.baseUrl}/users/${post.userId}`);
        return forkJoin({
          post: of(post),
          user: user$
        });
      }),
      catchError(error => {
        console.error('Error fetching post with user:', error);
        return throwError(() => 'Failed to fetch post with user details');
      })
    );
  }

  // Using combineLatest to get posts and users
  getPostsAndUsers(): Observable<{ posts: Post[]; users: User[] }> {
    const posts$ = this.http.get<Post[]>(`${this.baseUrl}/posts`).pipe(
      map(posts => posts.slice(0, 5))  // Take first 5 posts for demonstration
    );
    const users$ = this.http.get<User[]>(`${this.baseUrl}/users`).pipe(
      map(users => users.slice(0, 3))  // Take first 3 users for demonstration
    );

    return combineLatest({
      posts: posts$,
      users: users$
    }).pipe(
      catchError(error => {
        console.error('Error fetching posts and users:', error);
        return throwError(() => 'Failed to fetch posts and users');
      })
    );
  }

  // Get shared counter observable
  getSharedCounter(): Observable<number> {
    return this.sharedCounter$;
  }

  // Using mergeMap to get comments for multiple posts
  getPostComments(postIds: number[]): Observable<any[]> {
    return from(postIds).pipe(
      mergeMap(id => this.http.get<any[]>(`${this.baseUrl}/posts/${id}/comments`)),
      map(comments => comments.slice(0, 2)), // Take first 2 comments for demo
      toArray(),
      catchError(error => {
        console.error('Error fetching comments:', error);
        return throwError(() => 'Failed to fetch comments');
      })
    );
  }

  // Using concatMap to sequentially get todos
  getTodosSequentially(userIds: number[]): Observable<any> {
    return from(userIds).pipe(
      concatMap(userId => 
        this.http.get<any[]>(`${this.baseUrl}/users/${userId}/todos`).pipe(
          delay(1000), // Artificial delay to demonstrate sequential execution
          map(todos => ({ userId, todos: todos.slice(0, 2) })) // Take first 2 todos
        )
      ),
      catchError(error => {
        console.error('Error fetching todos:', error);
        return throwError(() => 'Failed to fetch todos');
      })
    );
  }

  // Using exhaustMap to prevent rapid-fire requests
  getPhotos(albumId: number): Observable<any[]> {
    return of(albumId).pipe(
      exhaustMap(id => 
        this.http.get<any[]>(`${this.baseUrl}/albums/${id}/photos`).pipe(
          map(photos => photos.slice(0, 5)) // Take first 5 photos
        )
      ),
      catchError(error => {
        console.error('Error fetching photos:', error);
        return throwError(() => 'Failed to fetch photos');
      })
    );
  }

  // Using mergeMap with concurrent limit
  getAlbums(userIds: number[]): Observable<any> {
    return from(userIds).pipe(
      mergeMap(
        userId => this.http.get<any[]>(`${this.baseUrl}/users/${userId}/albums`).pipe(
          map(albums => ({ userId, albums: albums.slice(0, 2) }))
        ),
        3 // Concurrent limit of 3
      ),
      catchError(error => {
        console.error('Error fetching albums:', error);
        return throwError(() => 'Failed to fetch albums');
      })
    );
  }

  // Add a method to fetch comments
  getComments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/comments`).pipe(
      tap(comments => console.log('Fetched comments:', comments)),
      catchError(error => {
        console.error('Error fetching comments:', error);
        return throwError(() => 'Failed to fetch comments');
      })
    );
  }
}
