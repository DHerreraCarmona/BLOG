import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Post } from '@shared/models/post';
import { AuthorPost} from '@shared/models/author'
import { PostComponent } from "@post/components/post/post.component";
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { LikeService } from '@shared/services/like.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Like } from '@shared/models/like';

@Component({
  selector: 'app-post-list',
  imports: [PostComponent,CommonModule],
  templateUrl: './post_list.component.html',
})
export class PostListComponent {

  posts: Post[]= [];
  currentUserId!: number;
  userLikes: number[] = [];

  showPostDetail = false;
  postDetail: Post = {
    id: 0,
    author: {
      id: 0,
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
    private postService: PostService,
    private authService: AuthService,
    private likeService: LikeService,
      ){}

  async ngOnInit(): Promise<void> {
    try {
      this.currentUserId = await this.authService.getUser().id;
  
      forkJoin({
        likes: this.likeService.getLikesByUser(this.currentUserId),
        postsResponse: this.postService.getAllPosts()
      }).subscribe({
        next: ({ likes, postsResponse }) => {
          this.userLikes = likes;
  
          this.posts = postsResponse.results.map((post: Post) => ({
            ...post,
            isPostOwner: post.author.id === this.currentUserId,
            isLiked: likes.includes(post.id)
          })).reverse();

        },
        error: (err) => {
          console.error('Error fetching posts or likes:', err);
        }
      });
    } catch (error) {
      console.error('Error initializing component:', error);
    }
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
