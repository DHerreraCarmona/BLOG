import { Component, Input, OnInit } from '@angular/core';

import { Post } from '@shared/models/post';
import { AuthorPost } from '@shared/models/author';
import { PostService } from '@shared/services/post.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post',
  imports: [CommonModule],
  templateUrl: './post.component.html',
  standalone: true,
})
export class PostComponent implements OnInit{
  @Input() post!: Post;

  posts: Post[]= [];
  showPostDetail = false;
  postDetail: Post = {
    id: 0,
    author: {
      username: '',
      team: ''
    },
    title: '',
    excerpt: '',
    created_at: '',
    countLikes: 0,
    countComments: 0
  };

  constructor(
    private postService: PostService
  ){}

  ngOnInit(): void {
    this.postService.getAllPosts().subscribe(data => {
      this.posts = data.results;
    });
  }

  togglePostDetail(show?: boolean) {
    this.showPostDetail = show ?? !this.showPostDetail;
  }
  
  onShowDetail(id: number): void {
    this.postService.getPost(id).subscribe({
      next: (data) => {
        this.postDetail = data;
        this.togglePostDetail(true);
      },
      error: (err) => {
        console.error(`Error: post ${id} not founded`, err);
      }
    });
  }
  

  createNewPost(newPost: Post): void {  
    this.postService.createPost(newPost).subscribe({
      next: (data) => {
        this.posts.unshift(data);
      },
      error: (err) => {
        console.error('Error al crear post', err);
      }
    });
  }
  
}

