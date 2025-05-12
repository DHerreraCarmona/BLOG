import { Component, EventEmitter, Inject, Input, Output, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayModule, OverlayRef} from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

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

@Component({
  selector: 'app-detail',
  imports: [CommonModule,ReactiveFormsModule,OverlayModule],
  templateUrl: './detail.component.html',
})
export class DetailComponent {
  @Output() commentCreated = new EventEmitter<number>(); 
  post!: Post;
  content!: string;
  likes: Like[] = [];
  comments: Comment[] = [];
  isAuth = false;
  user: AuthorShort = {username: ''};
  isOwnerOrTeamEdit = false;
  isLikesOverlayOpen: boolean = false;
  form;
  newComment!:createCommentModel;
  private authSubscription?: Subscription;  
  private overlayRef: OverlayRef | null = null;

  constructor(
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
    private authService: AuthService,
    private formBuilder: FormBuilder,  
    private dialogRef: DialogRef<PostDetail>,
    @Inject(DIALOG_DATA) private data: { post: Post;},
  ){
      this.form = this.formBuilder.nonNullable.group({
        content: ['', Validators.required],
      });
      this.post = data.post;
  }

  ngOnInit(): void {
    this.fetchData();
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

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.overlayRef) {  // Destroy overlay if it exists
      this.overlayRef.dispose();
    }
  }

  fetchData() {
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

    this.likeService.getLikes(this.post.id).subscribe((likes) => {
      this.likes = Array.isArray(likes) ? likes.reverse() : [];
    });

    this.commentService.getComments(this.post.id).subscribe({
      next: (data) => {
        this.comments = data;
      },
      error: (error) => {
        console.error('Error fetching comments :', error);
      }
    });
  }
  
  postComment() {
    if (this.form.invalid){
      return;
    }
     
    this.newComment = { 
      author: this.user,
      content: this.form.getRawValue().content
    } as createCommentModel;
    
    this.commentService.postComment(this.post.id, this.newComment).subscribe({
      next: (comment) => {
        this.comments = [ ...this.comments,comment];
        this.resetForm();
        this.commentCreated.emit(this.post.id);
      },
      error: (error) => {
        console.error('Error creating comment:', error);
      }
    });
  }

  resetForm(): void {
    this.form.reset();
  }

  close(){
    this.dialogRef.close(); 
  }  
    
}
