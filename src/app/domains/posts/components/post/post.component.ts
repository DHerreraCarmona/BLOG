import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';

import { Post } from '@shared/models/post';
import { Like } from '@shared/models/like';
import { AuthorPost } from '@shared/models/author';
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { LikeService } from '@shared/services/like.service';
import { map, tap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-post',
  imports: [CommonModule,OverlayModule],
  templateUrl: './post.component.html',
})
export class PostComponent implements OnInit{
  @Input() post!: Post;
  isAuth = false;
  user: AuthorPost = {
    id: -1,
    username: '',
    team: ''
  }
  currentUserId: number= -1;
  isPostOwner = false;
  showPostDetail = false;

  constructor(
    private likeService: LikeService,
    private authService: AuthService,
  ){}
  
  likes: Like[] = []
  likesLoaded: boolean = false;
  isLikesOverlayOpen: boolean = false;

  ngOnInit(): void {
    this.isAuth = this.authService.isAuthenticated;
  
    if(this.isAuth){
      this.user = this.authService.getUser();
      this.currentUserId = this.user.id;
      this.currentUserId == -1 ? this.isAuth= false : this.isAuth;
      this.post.isPostOwner = this.post.author.id === this.currentUserId;
    }
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

