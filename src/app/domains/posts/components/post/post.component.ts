import { CommonModule } from '@angular/common';
import { combineLatest, map, Observable, Subscription, take, tap } from 'rxjs';
import { OverlayModule} from '@angular/cdk/overlay';
import { Dialog, DialogRef} from '@angular/cdk/dialog';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Post, PostDetail } from '@shared/models/post';
import { Like } from '@shared/models/like';
import { AuthorPost } from '@shared/models/author';
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { LikeService } from '@shared/services/like.service';
import { CreateEditComponent } from '../createEdit/createEdit.component';
import { DetailComponent } from '../detail/detail.component';
import { PaginationComponent } from "@shared/components/pagination/pagination.component";
import { Pagination } from '@shared/models/pagination';

@Component({
  standalone: true,
  selector: 'app-post',
  templateUrl: './post.component.html',
  imports: [CommonModule, OverlayModule, PaginationComponent],
})
export class PostComponent implements OnInit, OnDestroy {
  @Input() post!: Post;
  @Output() postEdited = new EventEmitter<number>();
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
          this.checkPermissions();
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
        console.log('Post deleted successfully', response);
        this.isDeleteViewOpen = false;
        this.postDeleted.emit(this.post.id);
      },
      error: (error) => {
        console.error('Error deleting post', error);
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
      error(err) {
        console.error('Giving like/dislike error', err);
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
    const dialogEditRef = this.dialog.open(CreateEditComponent, {
      minWidth: '75%',
      maxWidth: '100%',
      data: {
        postId: this.post.id,
        isCreate: false,
      },
      panelClass: 'Edit-dialog-panel',
    });
    if (dialogEditRef && dialogEditRef.componentInstance) {
      dialogEditRef.componentInstance.postEdited.subscribe(postId=> {
        this.postEdited.emit(postId);
        this.onPostUpdated(postId);
      });
    }
  }

  onPostUpdated(postId: number) {
    this.postService.getPostDetail(postId).subscribe(postDetail => {
      const dialogRef = this.dialog.open(DetailComponent, {
        minWidth: '75%',
        maxWidth: '100%',
        autoFocus: false,
        data: { post: { ...this.post, ...postDetail, longContent: true } },
        panelClass: 'detail-dialog-panel',
      });
  
      // ⬅️ Usa afterClosed como punto seguro
      dialogRef.closed.subscribe((result) => {
        const data = result as { liked?: boolean; countLikes?: number; commentsCount?: number };

        if (data?.liked !== undefined && data.countLikes !== undefined) {
          this.post.isLiked = data.liked;
          this.post.countLikes = data.countLikes;
          this.postLiked.emit({
            id: this.post.id,
            isLiked: data.liked,
            countLikes: data.countLikes
          });
        }

        if (data?.commentsCount !== undefined) {
          this.post.countComments = data.commentsCount;
        }
      });
    });
  }

  openDetailModal() {
    const dialogDetailRef = this.dialog.open(DetailComponent, {
      minWidth: '75%',
      maxWidth: '100%',
      autoFocus: false,
      data: {
        post: this.post,
      },
      panelClass: 'detail-dialog-panel',
    });
    if (!dialogDetailRef || !dialogDetailRef.componentInstance) { return; }

    dialogDetailRef.componentInstance.postEdited.subscribe(postId=> {
      this.postEdited.emit(postId);
      this.onPostUpdated(postId)        
    });
    
    dialogDetailRef.componentInstance.postDeleted.subscribe((deletedPostId: number) => {
      if (deletedPostId === this.post.id) {
        this.postDeleted.emit(deletedPostId);
      }
    });

    dialogDetailRef.componentInstance.commentCreated.subscribe((postId: number) => {
      if (postId === this.post.id) {
        this.post.countComments++;
      }
    });

    dialogDetailRef.componentInstance.postLiked.subscribe((data) => {
      console.log('like from normal detail');

      if (data.id === this.post.id) {
        this.post.isLiked = data.isLiked;
        this.post.countLikes = data.countLikes;
        this.postLiked.emit({ 
          id: this.post.id, 
          isLiked: this.post.isLiked, 
          countLikes: this.post.countLikes 
        });
      }
    });
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

// private setupDetailDialogEvents(dialogRef: DialogRef<any>) {
  //   if (!dialogRef || !dialogRef.componentInstance) return;
    
  //   dialogRef.componentInstance.postEdited.subscribe((postId: number) => {
  //     this.postEdited.emit(postId);
  //     this.openDetailModal();
  //   });

  //   dialogRef.componentInstance.postDeleted.subscribe((postId: number) => {
  //     this.postDeleted.emit(postId);
  //   });

  //   dialogRef.componentInstance.commentCreated.subscribe((postId: number) => {
  //     if (postId === this.post.id) {
  //       this.post.countComments++;
  //     }
  //   });

  //   dialogRef.componentInstance.postLiked.subscribe((postId: number) => {
  //     if (postId === this.post.id) {
  //       this.post.isLiked = !this.post.isLiked;
  //       this.post.countLikes += this.post.isLiked ? 1 : -1;
  //       this.postLiked.emit(postId);
  //     }
  //   });
  // }


// getFullPost(id: number): Observable<Post> {
  //   return this.http.get<PostDetail>(`${this.baseUrl}/${id}`).pipe(
  //     map(detail => ({
  //       ...detail,
  //       excerpt: detail.content.slice(0, 150),
  //       longContent: true,
  //     }))
  //   );
  // }


  // this.postService.getPostDetail(postId).subscribe(updatedPost => {
        //   const detail
        //   this.post = updatedPost; // Update this component's @Input post
        //   this.checkPermissions(); // Re-check permissions
        // });