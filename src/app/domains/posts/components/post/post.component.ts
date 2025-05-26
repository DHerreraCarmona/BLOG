import { CommonModule } from '@angular/common';
import { combineLatest, map, Observable, Subscription, take, tap } from 'rxjs';
import { OverlayModule} from '@angular/cdk/overlay';
import { Dialog, DialogRef} from '@angular/cdk/dialog';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Post, PostDetail, PostEditCreate } from '@shared/models/post';
import { Like } from '@shared/models/like';
import { AuthorPost } from '@shared/models/author';
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { LikeService } from '@shared/services/like.service';
import { CreateEditComponent } from '../createEdit/createEdit.component';
import { DetailComponent } from '../detail/detail.component';
import { PaginationComponent } from "@shared/components/pagination/pagination.component";
import { Pagination } from '@shared/models/pagination';
import { environment } from '@env/enviroments.prod';
import { NotificationService } from '@shared/notifications/notifications.service';

@Component({
  standalone: true,
  selector: 'app-post',
  templateUrl: './post.component.html',
  imports: [CommonModule, OverlayModule, PaginationComponent],
})
export class PostComponent implements OnInit, OnDestroy {
  @Input() post!: Post;
  @Output() postEdited = new EventEmitter();
  @Output() postDeleted = new EventEmitter<number>();
  @Output() commentCountUpdated = new EventEmitter<{ id: number, count: number }>();
  @Output() postLiked = new EventEmitter<{id:number,isLiked:boolean,countLikes:number}>();

  isAuth = false;
  currentUserId: number = -1;
  isOwnerOrTeamEdit = false;
  user: AuthorPost = { id: -1, username: '', team: '' };
  likes: Like[] = [];
  likesLoaded: boolean = false;
  likesPag!: Pagination | null;
  private authSubscription?: Subscription;

  showPostDetail = false;
  isDeleteViewOpen = false;
  isLikesOverlayOpen = false;

  constructor(
    private dialog: Dialog,
    private likeService: LikeService,
    private authService: AuthService,
    private postService: PostService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.authSubscription = combineLatest([
      this.authService.authStatus$,
      this.authService.currentUser$,
    ])
      .pipe(
        tap(([isAuth, user]) => {
          this.isAuth = isAuth;
          this.isOwnerOrTeamEdit = false;
          this.currentUserId = user ? user.id : -1;
          this.user = user || { id: -1, username: '', team: '' };
        })
      )
      .subscribe();
  }

  checkPermissions(): void {
    this.isOwnerOrTeamEdit = this.post.author.id === this.currentUserId || this.post.author.team === this.user.team;
  }

  deletePost() {
    this.postService.deletePost(this.post.id).subscribe({
      next: (response) => {        
        this.isDeleteViewOpen = false;
        this.postDeleted.emit(this.post.id);
        this.notificationService.show('Post deleted successfully', 'success');
      },
      error: (error) => {
        this.notificationService.show('Error deleting post', 'error');
      },
    });
  }

  getPostLikes(targetPage: number = 1) {
    if (this.likesLoaded) return;

    this.likesLoaded = true;
    this.likeService.getLikes(this.post.id, targetPage).subscribe((response) => {
      this.likes = Array.isArray(response.results) ? response.results : [];
      this.likesPag = response.pagination;
    });
  }

  likesPagination(targetPage: number) {
    this.likeService
      .getLikes(this.post.id, targetPage)
      .subscribe((response) => {
        this.likes = Array.isArray(response.results) ? response.results : [];
        this.likesPag = response.pagination;
    });
  }

  giveLike() {
    if (!this.isAuth) return;

    this.likeService.giveLike(this.post.id).subscribe({
      next: () => {
        this.post.isLiked = !this.post.isLiked;
        this.post.countLikes += this.post.isLiked ? 1 : -1;
        this.postLiked.emit({ 
          id: this.post.id, 
          isLiked: this.post.isLiked, 
          countLikes: this.post.countLikes 
        });


        if (this.post.isLiked) {
          if (this.likesPag && this.likes.length >= 15) {
            this.likesLoaded = false;
            this.getPostLikes();
          } else {
            this.likes.push({
              post: { id: this.post.id, title: this.post.title },
              author: { username: this.authService.getUser().username },
            });
          }
        } else {
          if (
            this.likesPag &&
            this.likes.length == 1 &&
            this.likesPag.current_page > 1
          ) {
            this.likesLoaded = false;
            this.getPostLikes(this.likesPag.current_page - 1);
          } else {
            this.likes = this.likes.filter(
              (like) => like.author.username != this.user.username
            );
          }
        }
      },
      error: (error) => {
        this.notificationService.show('Error giving like/dislike to post', 'error');
      },
    });
  }

  toggleLikesOverlay(event: MouseEvent) {
    this.isLikesOverlayOpen = !this.isLikesOverlayOpen;
    if (this.isLikesOverlayOpen) {
      this.getPostLikes();
      this.clearCloseTimeout();
    } else {
      this.clearCloseTimeout();
    }
    event.stopPropagation();
  }

  openEditModal() {
    const dialogRef = this.dialog.open(CreateEditComponent, {
      minWidth: '75%',
      maxWidth: '100%',
      data: { postId: this.post.id, isCreate: false },
      panelClass: 'Edit-dialog-panel'
    });

    dialogRef.closed.subscribe((result) => {
      this.postEdited.emit();
      const updatedPost = result as PostEditCreate;

      if (updatedPost && typeof updatedPost === 'object' && 'id' in updatedPost) {

        this.post.title = updatedPost.title;

        if ( updatedPost.content.length > environment.maxExcerptLength){
          this.post.longContent = true;
          this.post.excerpt = updatedPost.content.substring(0, environment.maxExcerptLength);
        }else{
          this.post.longContent = false;
          this.post.excerpt =  updatedPost.content;
        }
        
        if(updatedPost.team!=2 && this.post.author.id != this.user.id ){
          this.post.isOwnerOrTeamEdit = false;
        }

        if(updatedPost.team!=0 || this.post.author.id == this.user.id ){
          this.openDetailModal(true)
        }
      }
    });
  }

  openDetailModal(fromUpdate = false) {
    const dialogRef = this.dialog.open(DetailComponent, {
      minWidth: '75%',
      maxWidth: '100%',
      data: { post: this.post },
      panelClass: 'detail-dialog-panel',
    });

      if (dialogRef.componentInstance) {

        dialogRef.componentInstance.postEdited.subscribe(_ => {
          this.postEdited.emit();
        });

        dialogRef.componentInstance.postDeleted.subscribe(deletedPostId => {
          this.postDeleted.emit(deletedPostId);
        });

        dialogRef.componentInstance.commentCreated.subscribe(postId => {
          if (postId === this.post.id) {
            this.post.countComments++;
            this.commentCountUpdated.emit({ id: postId, count: this.post.countComments });
          }
        });

        dialogRef.componentInstance.likeClicked.subscribe(() => {
          this.giveLike();
        });
      }
  }

  closeTimeoutId: any;
  readonly closeDelay = 50;

  startCloseTimeout() {
    this.closeTimeoutId = setTimeout(() => {
      this.isLikesOverlayOpen = false;
    }, this.closeDelay);
  }

  clearCloseTimeout() {
    if (this.closeTimeoutId) {
      clearTimeout(this.closeTimeoutId);
      this.closeTimeoutId = null;
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
