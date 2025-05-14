import { CommonModule } from '@angular/common';
import { combineLatest, map, Subscription, tap } from 'rxjs';
import { OverlayModule} from '@angular/cdk/overlay';
import { Dialog} from '@angular/cdk/dialog';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Post } from '@shared/models/post';
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
  imports: [CommonModule, OverlayModule, PaginationComponent],
  templateUrl: './post.component.html',
})
export class PostComponent implements OnInit, OnDestroy{
  @Input() post!: Post;
  @Output() postDeleted = new EventEmitter<number>();
  @Output() postLiked = new EventEmitter<number>();
  isAuth = false;
  user: AuthorPost = {id: -1, username: '', team: ''}
  currentUserId: number= -1;
  isOwnerOrTeamEdit = false;
  likes: Like[] = []
  likesLoaded: boolean = false;
  likesPag!: Pagination | null;
  private authSubscription?: Subscription;
  
  showPostDetail = false;
  isLikesOverlayOpen = false;
  isDeleteViewOpen = false;

  constructor(
    private likeService: LikeService,
    private authService: AuthService,
    private postService: PostService,
    private dialog: Dialog
  ){}

  ngOnInit(): void {
    this.authSubscription = combineLatest([
      this.authService.authStatus$,
      this.authService.currentUser$
    ]).pipe(
      tap(([isAuth, user]) => {
        this.isAuth = isAuth;
        this.user = user || { id: -1, username: '', team: '' };
        this.currentUserId = user ? user.id : -1;
        this.isOwnerOrTeamEdit = false;
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

  likesPagination(targetPage: number) {
    this.likeService.getLikes(this.post.id,targetPage).subscribe((response) => {
      this.likes = Array.isArray(response.results) ? response.results : []
      this.likesPag = response.pagination;
    });
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
  
  openDetailModal(){
    const dialogRef = this.dialog.open(DetailComponent, {
      minWidth: '75%',
      maxWidth: '100%',
      autoFocus: false,
      data: {
        post: this.post,
      },
      panelClass: 'detail-dialog-panel'
    });
    
    if (dialogRef && dialogRef.componentInstance) {
      dialogRef.componentInstance.commentCreated.subscribe((updatedPostId: number) => {
        if (updatedPostId === this.post.id) {
          this.post.countComments++;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}






