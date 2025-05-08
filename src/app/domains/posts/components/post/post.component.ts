import { CommonModule } from '@angular/common';
import { combineLatest, map, Subscription, tap } from 'rxjs';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { OverlayModule} from '@angular/cdk/overlay';

import { Post } from '@shared/models/post';
import { Like } from '@shared/models/like';
import { AuthorPost } from '@shared/models/author';
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { LikeService } from '@shared/services/like.service';

@Component({
  standalone: true,
  selector: 'app-post',
  imports: [CommonModule,OverlayModule],
  templateUrl: './post.component.html',
})
export class PostComponent implements OnInit, OnDestroy{
  @Input() post!: Post;
  @Output() postDeleted = new EventEmitter<number>();
  isAuth = false;
  user: AuthorPost = {id: -1, username: '', team: ''}
  currentUserId: number= -1;
  isPostOwner = false;
  showPostDetail = false;
  likes: Like[] = []
  likesLoaded: boolean = false;
  isLikesOverlayOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  private authSubscription?: Subscription;
  
  constructor(
    private likeService: LikeService,
    private authService: AuthService,
    private postService: PostService,
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
        this.isPostOwner = user ? this.post.author.id === user.id : false;
      })
    ).subscribe();
  }
  
  getPostLikes() {
    if (this.likesLoaded) return;
    
    this.likesLoaded = true;
    this.likeService.getLikes(this.post.id).subscribe((likes) => {
      this.likes = Array.isArray(likes) ? likes.reverse() : []
    });
  }

  giveLike(){
    if(!this.isAuth) return;

    this.likeService.giveLike(this.post.id).subscribe({
      next: ()=>{
        this.post.isLiked = !this.post.isLiked;
        this.post.countLikes += this.post.isLiked ? 1 : -1;

        if(this.post.isLiked){
          this.likes.push({
            post: { id: this.post.id, title: this.post.title },
            author: { username: this.authService.getUser().username }
          });
        }
        else{
          this.likes = this.likes.filter(like => like.author.username != this.user.username);
        }
      },
      error(err) {
        console.error('Giving like/dislike error',err);
      },
    })
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  deletePost() {
    this.postService.deletePost(this.post.id).subscribe({
      next: (response) => {
        console.log('Post deleted successfully', response);
        this.isDeleteModalOpen = false; 
        this.postDeleted.emit(this.post.id);
      },
      error: (error) => {
        console.error('Error deleting post', error);
      }
    });
  }

  closeModalOutside(event: Event) {
    if (event.target === event.currentTarget) {
      this.isDeleteModalOpen = false;
    }
  }

  // togglePostDetail(show?: boolean) {
  //   this.showPostDetail = show ?? !this.showPostDetail;
  // }
  
  // onShowDetail(id: number): void {
  //   this.postService.getPost(id).subscribe({
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

