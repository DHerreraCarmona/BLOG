import { Component, EventEmitter, Inject, Input, Output, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayModule, OverlayRef} from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { AuthorPost, AuthorShort } from '@shared/models/author';
import { Like } from '@shared/models/like';
import { Post, PostDetail } from '@shared/models/post';
import { PostService } from '@shared/services/post.service';
import { AuthService } from '@shared/services/auth.service';
import { combineLatest, Subscription, tap } from 'rxjs';
import { Comment, createCommentModel } from '@shared/models/comment';
import { CommentService } from '@shared/services/comment.service';
import { LikeService } from '@shared/services/like.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Pagination } from '@shared/models/pagination';
import { Router } from '@angular/router';
import { CreateEditComponent } from '../createEdit/createEdit.component';


@Component({
  selector: 'app-detail',
  imports: [CommonModule,ReactiveFormsModule,OverlayModule,PaginationComponent],
  templateUrl: './detail.component.html',
})
export class DetailComponent {
  @Output() commentCreated = new EventEmitter<number>(); 
  @Output() postLiked = new EventEmitter<number>();

  post!: Post;
  content!: string;
  likes: Like[] = [];
  comments: Comment[] = [];
  isAuth = false;
  user: AuthorShort = {username: ''};
  isOwnerOrTeamEdit = false;

  isDeleteViewOpen = false;
  isLikesOverlayOpen: boolean = false;
  form;
  newComment!:createCommentModel;
  private authSubscription?: Subscription;  
  private overlayRef: OverlayRef | null = null;
  
  likesLoaded: boolean = false;
  likesPag!: Pagination | null;
  commentsPag!: Pagination | null;

  constructor(
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private authService: AuthService,
    private formBuilder: FormBuilder,  
    private dialogRef: DialogRef<PostDetail>,
    private dialog: Dialog,
    @Inject(DIALOG_DATA) private data: { post: Post;},
  ){
      this.form = this.formBuilder.nonNullable.group({
        content: ['', Validators.required],
      });
      this.post = data.post;

      this.likeService.getLikes(this.post.id).subscribe((response) => {
        this.likes = Array.isArray(response.results) ? response.results.reverse() : [];
      });
  
      this.getComments();
  }

  ngOnInit(): void {
    if (!this.post.longContent){
      this.content = this.post.excerpt
    }
    else{
      this.postService.getPostDetail(this.post.id).subscribe({
        next: (data) => {
          this.content = data.content;
        },
        error: (error) => {
          console.error('Error fetching post detail:', error);
        }
      });
    }

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

  getPostLikes(targetPage: number = 1) {
    if (this.likesLoaded) return;
    
    this.likesLoaded = true;
    this.likeService.getLikes(this.post.id,targetPage).subscribe((response) => {
      this.likes = Array.isArray(response.results) ? response.results : []
      this.likesPag = response.pagination;
    });
  }

  likesPagination(targetPage: number) {
    this.likeService.getLikes(this.post.id,targetPage).subscribe((response) => {
      this.likes = Array.isArray(response.results) ? response.results : []
      this.likesPag = response.pagination;
    });
  }
  
  getComments(page: number | undefined = this.commentsPag?.current_page): void {
    this.commentService.getComments(this.post.id, page).subscribe({
      next: (response) => {
        this.comments = response.results;
        this.commentsPag = response.pagination;
      },
      error: (error) => {
        console.error('Error fetching comments :', error);
      }
    });
  }
  
  postComment() {
    if (this.form.invalid) { return; }
  
    this.newComment = {
      author: this.user,
      content: this.form.getRawValue().content
    } as createCommentModel;
  
    this.commentService.postComment(this.post.id, this.newComment).subscribe({
      next: (comment) => {
        this.resetForm();
        this.commentCreated.emit(this.post.id);
  
        if (this.commentsPag && this.comments.length >= 5) {
          const lastPage = this.commentsPag.total_pages+1;
          this.getComments(lastPage); 
        } else {
          this.getComments();
        }
      },
      error: (error) => {
        console.error('Error creating comment:', error);
      }
    });
  }

  giveLike(){
    if(!this.isAuth) return;

    this.likeService.giveLike(this.post.id).subscribe({
      next: ()=>{
        this.post.isLiked = !this.post.isLiked;
        this.post.countLikes += this.post.isLiked ? 1 : -1;
        this.postLiked.emit(this.post.id);

        if(this.post.isLiked){
          if(this.likesPag && this.likes.length >=15){
            this.likesLoaded = false;
            this.getPostLikes();
          }
          else{
            this.likes.push({
              post: { id: this.post.id, title: this.post.title },
              author: { username: this.authService.getUser().username }
            });
          }
        }
        else{
          if(this.likesPag && this.likes.length==1 && this.likesPag.current_page>1){
            this.likesLoaded = false;
            this.getPostLikes(this.likesPag.current_page-1);
          }
          else{
            this.likes = this.likes.filter(like => like.author.username != this.user.username);
          }
        }
      },
      error(err) {
        console.error('Giving like/dislike error',err);
      },
    })
  }
  
  paginated(targetPage: number) {
    this.getComments(targetPage);
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

  openEditModal(){
    this.dialog.open(CreateEditComponent,
      { minWidth: '75%',
        maxWidth: '100%',
        data:{
          postId: this.post.id,
          isCreate: false
        },
        panelClass: 'Edit-dialog-panel'
      },
    );
  }

  deletePost() {
    this.postService.deletePost(this.post.id).subscribe({
      next: (response) => {
        console.log('Post deleted successfully', response);
        this.isDeleteViewOpen = false; 
        location.reload();
      },
      error: (error) => {
        console.error('Error deleting post', error);
      }
    });
  }

  resetForm(): void {
    this.form.reset();
  }

  close(){
    this.dialogRef.close(); 
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
