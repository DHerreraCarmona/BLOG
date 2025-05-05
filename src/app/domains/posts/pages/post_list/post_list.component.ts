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
      this.currentUserId  = await this.authService.getUser().id;

      this.likeService.getLikesByUser(this.currentUserId).subscribe((likedPostIds) => {
        this.userLikes = likedPostIds;
      });
      console.log('User',this.currentUserId, 'likes loaded:', this.userLikes);

     
      this.postService.getAllPosts().subscribe({
        next: (response: { results: Post[] }) => {
          this.posts = response.results.map((post: Post) => ({
            ...post,
            isPostOwner: post.author.id === this.currentUserId
          }));
        },
        error: (error) => {
          console.error('Error loading posts:', error);
        }
      });
    } catch (error) {
      console.error('Error loading posts or user:', error);
    }
  }


  // ngOnInit(): void {
  //   this.user = this.authService.getUser();

  //   this.postService.getAllPosts().subscribe(data => {
  //     this.posts = data.results.reverse().map(post=>{
  //       return {
  //         ...post,
  //         isPostOwner: post.author.id === this.user.id
  //       };
  //     });
  //   });
  // }
  
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
