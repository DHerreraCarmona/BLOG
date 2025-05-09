import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Post, PostDetail } from '@shared/models/post';
import { AuthorPost} from '@shared/models/author'
import { PostComponent } from "@post/components/post/post.component";
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { LikeService } from '@shared/services/like.service';
import { catchError, filter, firstValueFrom, forkJoin, map, of, switchMap, take } from 'rxjs';
import { Like } from '@shared/models/like';

@Component({
  selector: 'app-post-list',
  imports: [PostComponent,CommonModule],
  templateUrl: './post_list.component.html',
})
export class PostListComponent {

  posts: Post[]= [];
  currentUserId!: number;
  userLikes: number[] = [];

  showPostDetail = false;
  postDetail!: PostDetail
  
  constructor(
    private postService: PostService,
    private authService: AuthService,
    private likeService: LikeService,
  ){}

  ngOnInit(): void {
    this.authService.authStatus$.pipe(
      switchMap(isAuth => {
        if (!isAuth) {
            // Usuario no autenticado: Cargar posts públicos
            return this.postService.getAllPosts().pipe(
                map(posts => this.mapPostsForAnonymous(posts.results))
            );
        } 
        // Usuario autenticado: Cargar posts y likes del usuario
        return this.authService.currentUser$.pipe(
            filter(user => user !== null),
            take(1),
            switchMap(user =>{
              this.currentUserId = user.id;
              return forkJoin({
                posts: this.postService.getAllPosts(),
                likes: this.likeService.getLikesByUser(user.id)
              }).pipe(
                map(({ posts, likes }) =>
                    this.mapPostsForAuthenticated(posts.results, user, likes)
                )
              );
          })
        );
      }),
      catchError(err => {
          console.error('Error loading posts:', err);
          return of([]);
      })
    ).subscribe(posts => {
        this.posts = posts.reverse();
    });
  }

  private mapPostsForAnonymous(posts: Post[]): Post[] {
    return posts.map(post => ({
        ...post,
        isPostOwner: false,
        isLiked: false
    }));
  }

  private mapPostsForAuthenticated(posts: Post[], user: AuthorPost, likes: number[]): Post[] {
      return posts.map(post => ({
          ...post,
          isPostOwner: post.author.id === user.id,
          isLiked: likes.includes(post.id)
      }));
  }

  onPostDeleted(postId: number) {
    this.posts = this.posts.filter(post => post.id !== postId);
  }

  
  // togglePostDetail(show?: boolean) {
  //   this.showPostDetail = show ?? !this.showPostDetail;
  // }
    
  // onShowDetail(id: number): void {
  //   this.postService.getPostDetail(id).subscribe({
  //     next: (data) => {
  //       this.postDetail = data;
  //       this.togglePostDetail(true);
  //     },
  //     error: (err) => {
  //       console.error(`Error: post ${id} not founded`, err);
  //     }
  //   });
  // }
    
  
  // createNewPost(newPost: Post): void {  
  //   this.postService.createPost(newPost).subscribe({
  //     next: (data) => {
  //       this.posts.unshift(data);
  //     },
  //     error: (err) => {
  //       console.error('Error al crear post', err);
  //     }
  //   });
  // }
}
