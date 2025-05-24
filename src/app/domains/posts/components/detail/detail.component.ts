import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import {  Component,  Inject,  EventEmitter,  Input,  Output,  ViewContainerRef} from '@angular/core';

import { AuthorPost, AuthorShort } from '@shared/models/author';
import { Like } from '@shared/models/like';
import { Post, PostDetail, PostEditCreate } from '@shared/models/post';
import { PostService } from '@shared/services/post.service';
import { AuthService } from '@shared/services/auth.service';
import { combineLatest, Subscription, tap } from 'rxjs';
import { Comment, createCommentModel } from '@shared/models/comment';
import { CommentService } from '@shared/services/comment.service';
import { LikeService } from '@shared/services/like.service';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Pagination } from '@shared/models/pagination';
import { CreateEditComponent } from '../createEdit/createEdit.component';

@Component({
  selector: 'app-detail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayModule,
    PaginationComponent,
  ],
  templateUrl: './detail.component.html',
})
export class DetailComponent {
  @Output() postEdited = new EventEmitter<number>();
  @Output() postDeleted = new EventEmitter<number>();
  @Output() commentCreated = new EventEmitter<number>();
  @Output() ready = new EventEmitter<DetailComponent>();
  @Output() likeClicked = new EventEmitter<void>();
  @Output() postLiked = new EventEmitter<{id:number,isLiked:boolean,countLikes:number}>();

  post!: Post;
  content!: string;
  likes: Like[] = [];
  comments: Comment[] = [];
  isAuth = false;
  user: AuthorShort = { username: '' };
  currentUserId: number = -1;
  isOwner = false;
  isOwnerOrTeamEdit = false;

  isDeleteViewOpen = false;
  isLikesOverlayOpen: boolean = false;
  commentForm;
  newComment!: createCommentModel;
  private authSubscription!: Subscription;
  private overlayRef: OverlayRef | null = null;

  likesLoaded: boolean = false;
  likesPag!: Pagination | null;
  commentsPag!: Pagination | null;

  constructor(
    private dialog: Dialog,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private dialogRef: DialogRef<Post>,
    @Inject(DIALOG_DATA) private data: { post: Post }
  ) {
    this.commentForm = this.formBuilder.nonNullable.group({
      content: ['', Validators.required],
    });

    this.post = data.post;

    // this.likeService.getLikes(this.post.id).subscribe((response) => {
    //   this.likes = Array.isArray(response.results) ? response.results : [];
    // });
  }

  ngOnInit(): void {
    this.getPostDetail();
    this.getPostLikes();
    this.getComments();

    this.authSubscription = combineLatest([
      this.authService.authStatus$,
      this.authService.currentUser$
    ]).pipe(
      tap(([isAuth, user]) => {
        this.isAuth = isAuth;
        this.user = user ? { username: user.username } : { username: '' };
      })
    ).subscribe();
  }

  afterViewInit() {
    this.ready.emit(this);
  }

  getPostDetail(): void {
    this.postService.getPostDetail(this.post.id).subscribe({
      next: (detail) => {
        this.content = detail.content;
        this.post.title = detail.title;
        this.post.countLikes = detail.countLikes;
        this.post.created_at = detail.created_at;
      },
      error: (err) => console.error('Error fetching post detail:', err)
    });
  }

  deletePost() {
    this.postService.deletePost(this.post.id).subscribe({
      next: (response) => {
        this.dialogRef.close();
        this.isDeleteViewOpen = false;
        this.postDeleted.emit(this.post.id);
        console.log('Post deleted successfully', response);
      },
      error: (error) => {
        this.isDeleteViewOpen = false;
        console.error('Error deleting post', error);
      },
    });
  }

  getComments(page: number | undefined = this.commentsPag?.current_page): void {
    this.commentService.getComments(this.post.id, page).subscribe({
      next: (response) => {
        this.comments = response.results;
        this.commentsPag = response.pagination;
      },
      error: (error) => {
        console.error('Error fetching comments:', error);
      },
    });
  }

  getPostLikes(targetPage: number = 1) {
    if (this.likesLoaded) return;

    this.likesLoaded = true;
    this.likeService
      .getLikes(this.post.id, targetPage)
      .subscribe((response) => {
        this.likes = Array.isArray(response.results) ? response.results : [];
        this.likesPag = response.pagination;
      });
  }
  
  postComment() {
    if (this.commentForm.invalid) {
      return;
    }

    this.newComment = {
      author: this.user,
      content: this.commentForm.getRawValue().content,
    } as createCommentModel;

    this.commentService.postComment(this.post.id, this.newComment).subscribe({
      next: (comment) => {
        this.commentForm.reset();
        this.commentCreated.emit(this.post.id);

        if (this.commentsPag && this.comments.length >= 5) {
          const lastPage = this.commentsPag.total_pages + 1;
          this.getComments(lastPage);
        } else {
          this.getComments();
        }
      },
      error: (error) => {
        console.error('Error creating comment:', error);
      },
    });
  }

  giveLike() {
    if (!this.isAuth) return;

    // this.post.isLiked = !this.post.isLiked;
    // this.post.countLikes += this.post.isLiked ? 1 : -1;
    // this.postLiked.emit({
    //   id: this.post.id,
    //   isLiked: this.post.isLiked,
    //   countLikes: this.post.countLikes,
    // });

    this.likeClicked.emit();
  }

  openEditModal() {
    const dialogRef = this.dialog.open(CreateEditComponent, {
      minWidth: '75%',
      maxWidth: '100%',
      data: { postId: this.post.id, isCreate: false },
      panelClass: 'Edit-dialog-panel'
    });

    dialogRef.closed.subscribe((result) => {
      const updatedPost = result as PostEditCreate;
      
      if (updatedPost && typeof updatedPost === 'object' && 'id' in updatedPost) {
        this.post.title = updatedPost.title;
        this.post.excerpt = updatedPost.content;

        console.log(this.post);
        this.postLiked.emit({
          id: this.post.id,
          isLiked: this.post.isLiked,
          countLikes: this.post.countLikes
        });
      }
    });
  }

  checkPermissions(): void {
    this.isOwner = this.post.author.id === this.currentUserId;
    this.isOwnerOrTeamEdit = this.isOwner || this.post.author.team === this.authService.getUser().team;
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

  likesPagination(targetPage: number) {
    this.likeService
      .getLikes(this.post.id, targetPage)
      .subscribe((response) => {
        this.likes = Array.isArray(response.results) ? response.results : [];
        this.likesPag = response.pagination;
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

  close() {
    this.dialogRef.close(this.post);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }
}

// giveLike() {
  //   if (!this.isAuth) return;

  //   this.likeService.giveLike(this.post.id).subscribe({
  //     next: () => {
  //       this.post.isLiked = !this.post.isLiked;
  //       this.post.countLikes += this.post.isLiked ? 1 : -1;
  //       this.postLiked.emit({ 
  //         id: this.post.id, 
  //         isLiked: this.post.isLiked, 
  //         countLikes: this.post.countLikes 
  //       });

  //       if (this.post.isLiked) {
  //         if (this.likesPag && this.likes.length >= 15) {
  //           this.likesLoaded = false;
  //           this.getPostLikes();
  //         } else {
  //           this.likes.push({
  //             post: { id: this.post.id, title: this.post.title },
  //             author: { username: this.authService.getUser().username },
  //           });
  //         }
  //       } else {
  //         if (
  //           this.likesPag &&
  //           this.likes.length == 1 &&
  //           this.likesPag.current_page > 1
  //         ) {
  //           this.likesLoaded = false;
  //           this.getPostLikes(this.likesPag.current_page - 1);
  //         } else {
  //           this.likes = this.likes.filter(
  //             (like) => like.author.username != this.user.username
  //           );
  //         }
  //       }
  //     },
  //     error(err) {
  //       console.error('Giving like/dislike error', err);
  //     },
  //   });
  // }