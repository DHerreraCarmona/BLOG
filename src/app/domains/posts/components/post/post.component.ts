import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';

import { Post } from '@shared/models/post';
import { Like } from '@shared/models/like';
import { AuthorPost } from '@shared/models/author';
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { LikeService } from '@shared/services/like.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-post',
  imports: [CommonModule,OverlayModule],
  templateUrl: './post.component.html',
  standalone: true,
})
export class PostComponent implements OnInit{
  @Input() post!: Post;
  currentUserId!: number;
  isPostOwner = false;
  showPostDetail = false;
  // auth: boolean = false;
  // posts: Post[]= [];
  // postDetail: Post = {
  //   id: 0,
  //   author: {
  //     id:0,
  //     username: '',
  //     team: ''
  //   },
  //   title: '',
  //   excerpt: '',
  //   created_at: '',
  //   countLikes: 0,
  //   countComments: 0
  // };
  // user: AuthorPost = {
  //   id:0,
  //   username: '',
  //   team: ''
  // };
  constructor(
    private likeService: LikeService,
    private authService: AuthService,
  ){}
  
  likes: Like[] = []
  likesLoaded: boolean = false;
  isLikesOverlayOpen: boolean = false;

  ngOnInit(): void {
    this.currentUserId = this.authService.getUser().id
    this.post.isPostOwner = this.post.author.id === this.currentUserId;
  }
  
  getPostLikes() {
    if (this.likesLoaded) return;
  
    this.likesLoaded = true;
    this.likeService.getLikes(this.post.id).subscribe((likes) => {
      this.likes = Array.isArray(likes) ? likes.reverse() : []
    });
  }


  // ngOnInit(): void {
  // this.auth = this.authService.isAuthenticated;
  // this.user = this.authService.getUser();
  // this.postService.getAllPosts().subscribe(data => {
  //   this.posts = data.results.map(post=>{
  //     return {
  //       ...post,
  //       isPostOwner: post.author.id === this.user.id,
  //     };
  //   });
  // });
  // }

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

