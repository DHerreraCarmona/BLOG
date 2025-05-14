import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, filter, firstValueFrom, forkJoin, map, of, switchMap, take } from 'rxjs';

import { Post, PostDetail } from '@shared/models/post';
import { AuthorPost} from '@shared/models/author'
import { PostComponent } from "@post/components/post/post.component";
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { LikeService } from '@shared/services/like.service';
import { Pagination } from '@shared/models/pagination';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-post-list',
  imports: [PostComponent,CommonModule,PaginationComponent],
  templateUrl: './post_list.component.html',
})
export class PostListComponent {

  posts: Post[]= [];
  currentUserId!: number;
  userLikes: number[] = [];
  pagination: Pagination | null = null;

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
        // Usuario no autenticado: Cargar posts públicos
        if (!isAuth) {
          return this.postService.getAllPosts().pipe(
            map(response =>{
              this.pagination = response.pagination;
              return this.mapPostsForAnonymous(response.results);
            })
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
              map(({ posts, likes }) =>{
                this.pagination = posts.pagination;
                this.userLikes = likes;
                const mappedPost = this.mapPostsForAuthenticated(posts.results, user,likes)
                return mappedPost;
              }));
          })
        );
      }),
      catchError(err => {
          console.error('Error loading posts:', err);
          return of([]);
      })
    ).subscribe(posts => {
        this.posts = posts;
    });
  }

  private mapPostsForAnonymous(posts: Post[]): Post[] {
    return posts.map(post => ({
        ...post,
        isOwnerOrTeamEdit: false,
        isLiked: false
    }));
  }

  private mapPostsForAuthenticated(posts: Post[], user: AuthorPost, likes: number[]): Post[] {
    return posts.map(post => ({
        ...post,
        isOwnerOrTeamEdit: post.author.id === user.id ? true:
                    post.author.team === "None" || user.team === "None"? false:
                    post.author.team === user.team && post.teamEdit ? true: false,
        isLiked: likes.includes(post.id)
    }));
  }

  paginated(targetPage: number){
    if (!this.pagination){return}
    if (targetPage <= 0 || targetPage > this.pagination.total_pages){
      return
    }

    const userString = localStorage.getItem("currentUser");
    
    if(userString){
      this.postService.getAllPosts(targetPage).subscribe(response => {
        this.pagination = response.pagination;
        this.posts = this.mapPostsForAuthenticated(response.results, JSON.parse(userString), this.userLikes)
      });
    }
  }

  onPostLiked(postId: number) {
    if (this.userLikes.includes(postId)) {
      this.userLikes = this.userLikes.filter(id => id !== postId);
      return
    }
    this.userLikes.push(postId)
  }

  onPostDeleted(postId: number) {
    this.posts = this.posts.filter(post => post.id !== postId);
  }
}
