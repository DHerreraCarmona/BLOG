import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, delay, filter, forkJoin, map, of, switchMap, take, tap } from 'rxjs';

import { AuthorPost } from '@shared/models/author';
import { Pagination } from '@shared/models/pagination';
import { Post, PostDetail } from '@shared/models/post';
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { LikeService } from '@shared/services/like.service';
import { PostComponent } from '@post/components/post/post.component';
import { NotificationService } from '@shared/notifications/notifications.service';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';


@Component({
  selector: 'app-post-list',
  imports: [PostComponent, CommonModule, PaginationComponent],
  templateUrl: './post_list.component.html',
})
export class PostListComponent {
  posts: Post[] = [];
  currentUserId!: number;
  userLikes: number[] = [];
  pagination: Pagination | null = null;

  showPostDetail = false;
  postDetail!: PostDetail;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private likeService: LikeService,
    private notificationService: NotificationService,

  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  onPostDeleted(): void {
    of(null).pipe(delay(50)).subscribe(() =>this.loadPosts(this.pagination?.current_page));
  }

  onPostEdit(): void {
    of(null).pipe(delay(50)).subscribe(() => this.loadPosts(this.pagination?.current_page));
  }

  onPostCreate(): void {
    of(null).pipe(delay(50)).subscribe(() =>this.loadPosts(this.pagination?.current_page));
  }
  
  onPostLiked(data: { id: number, isLiked: boolean, countLikes: number }): void {
    const post = this.posts.find(p => p.id === data.id);
    if (!post) return;

    post.isLiked = data.isLiked;
    post.countLikes = data.countLikes;

    if (data.isLiked) {
      if (!this.userLikes.includes(data.id)) {
        this.userLikes.push(data.id);
      }
    } else {
      this.userLikes = this.userLikes.filter(id => id !== data.id);
    }
  }

  loadPosts(page: number = 1): void {
    this.authService.authStatus$.pipe(
      switchMap(isAuth => {
        if (!isAuth) {
          return this.postService.getAllPosts(page).pipe(
            map(response => {
              this.pagination = response.pagination;
              return this.mapPostsForAnonymous(response.results);
            })
          );
        }

        return this.authService.currentUser$.pipe(
          filter(user => user !== null),
          take(1),
          switchMap(user => {
            this.currentUserId = user.id;
            return forkJoin({
              posts: this.postService.getAllPosts(page),
              likes: this.likeService.getLikesByUser(user.id)
            }).pipe(
              map(({ posts, likes }) => {
                this.pagination = posts.pagination;
                this.userLikes = likes;
                return this.mapPostsForAuthenticated(posts.results, user, likes);
              })
            );
          })
        );
      }),
      catchError(err => {
        this.notificationService.show(`Error loading posts`, 'error');
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
      isOwnerOrTeamEdit: post.author.id === user.id ? true :
        post.author.team === 'None' || user.team === 'None' ? false :
        post.author.team === user.team && post.teamEdit ? true : false,
      isLiked: likes.includes(post.id)
    }));
  }

  paginated(targetPage: number): void {
    if (!this.pagination) return;
    if (targetPage <= 0 || targetPage > this.pagination.total_pages) return;

    this.loadPosts(targetPage);
  }
}
