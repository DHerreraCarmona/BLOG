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
import { environment } from '@env/enviroments.prod';
import { NotificationService } from '@shared/notifications/notifications.service';

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
    private dialogRef: DialogRef<Post>,
    private commentService: CommentService,
    private notificationService: NotificationService,
    @Inject(DIALOG_DATA) private data: { post: Post }
  ) {
    this.commentForm = this.formBuilder.nonNullable.group({
      content: ['', Validators.required],
    });

    this.post = data.post;

    this.likeService.getLikes(this.post.id).subscribe((response) => {
      this.likes = Array.isArray(response.results) ? response.results : [];
    });
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

  getPostDetail(): void {
    this.postService.getPostDetail(this.post.id).subscribe({
      next: (detail) => {
        this.content = detail.content;
        this.post.title = detail.title;
        this.post.countLikes = detail.countLikes;
        this.post.created_at = detail.created_at;
      },
      error: (err) => this.notificationService.show('Error fetching post detail', 'error')      
    });
  }

  deletePost() {
    this.postService.deletePost(this.post.id).subscribe({
      next: (response) => {
        this.dialogRef.close();
        this.isDeleteViewOpen = false;
        this.postDeleted.emit(this.post.id);
        this.notificationService.show('Post deleted succesfully', 'success');

      },
      error: (error) => {
        this.isDeleteViewOpen = false;
        this.notificationService.show('Error deleting post', 'error');

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
        this.notificationService.show('Error fetching post comments', 'error');
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
          const lastPage = this.commentsPag.total_pages;
          this.getComments(lastPage);
        } else {
          this.getComments();
        }
      },
      error: (error) => {
        this.notificationService.show('Error creating new comment', 'error');
      },
    });
  }

  giveLike() {
    if (!this.isAuth) return;
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
        this.content= updatedPost.content;
        this.post.title = updatedPost.title;
        if ( updatedPost.content.length > environment.maxExcerptLength){
          this.post.excerpt = updatedPost.content.substring(0, environment.maxExcerptLength);
          this.post.longContent = true;
        }else{
          this.post.excerpt =  updatedPost.content;
          this.post.longContent = false;
        }
        
        if(updatedPost.team!=2 && this.post.author.id != this.authService.user?.id ){
          this.post.isOwnerOrTeamEdit = false;
        }

        if(updatedPost.team==0 && this.post.author.id != this.authService.user?.id){
          this.close();
        }

        this.postLiked.emit({
          id: this.post.id,
          isLiked: this.post.isLiked,
          countLikes: this.post.countLikes
        });
      }
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
