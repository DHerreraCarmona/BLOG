import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, filter, firstValueFrom, forkJoin, map, of, switchMap, take } from 'rxjs';

import { Post, PostDetail } from '@shared/models/post';
import { AuthorPost} from '@shared/models/author'
import { PostComponent } from "@post/components/post/post.component";
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { LikeService } from '@shared/services/like.service';
import { Pagination } from '@shared/models/pagination';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-post-list',
  imports: [PostComponent,CommonModule,PaginationComponent],
  templateUrl: './post_list.component.html',
})
export class PostListComponent {

  posts: Post[]= [];
  currentUserId!: number;
  userLikes: number[] = [];
  pagination: Pagination | null = null;

  showPostDetail = false;
  postDetail!: PostDetail
  
  constructor(
    private postService: PostService,
    private authService: AuthService,
    private likeService: LikeService,
  ){}

  ngOnInit(): void {
    this.authService.authStatus$.pipe(
      switchMap(isAuth => {
        if (!isAuth) {                              // Usuario no autenticado: Cargar posts públicos
          return this.postService.getAllPosts().pipe(
            map(response =>{
              this.pagination = response.pagination;
              return this.mapPostsForAnonymous(response.results);
            })
          );
        }         
        return this.authService.currentUser$.pipe(   // Usuario autenticado: Cargar posts y likes del usuario
          filter(user => user !== null),
          take(1),
          switchMap(user =>{
            this.currentUserId = user.id;
            return forkJoin({
              posts: this.postService.getAllPosts(),
              likes: this.likeService.getLikesByUser(user.id)
            }).pipe(
              map(({ posts, likes }) =>{
                this.pagination = posts.pagination;
                this.userLikes = likes;
                const mappedPost = this.mapPostsForAuthenticated(posts.results, user,likes)
                return mappedPost;
              }));
          })
        );
      }),
      catchError(err => {
          console.error('Error loading posts:', err);
          return of([]);
      })
    ).subscribe(posts => {
        this.posts = posts;
    });
  }

  private mapPostsForAnonymous(posts: Post[]): Post[] {
    return posts.map(post => ({
        ...post,
        isOwnerOrTeamEdit: false,
        isLiked: false
    }));
  }

  private mapPostsForAuthenticated(posts: Post[], user: AuthorPost, likes: number[]): Post[] {
    return posts.map(post => ({
        ...post,
        isOwnerOrTeamEdit: post.author.id === user.id ? true:
                    post.author.team === "None" || user.team === "None"? false:
                    post.author.team === user.team && post.teamEdit ? true: false,
        isLiked: likes.includes(post.id)
    }));
  }

  paginated(targetPage: number){
    if (!this.pagination){return}
    if (targetPage <= 0 || targetPage > this.pagination.total_pages){
      return
    }

    const userString = localStorage.getItem("currentUser");
    
    if(userString){
      this.postService.getAllPosts(targetPage).subscribe(response => {
        this.pagination = response.pagination;
        this.posts = this.mapPostsForAuthenticated(response.results, JSON.parse(userString), this.userLikes)
      });
    }
  }

  onPostLiked(data: { id: number, isLiked: boolean, countLikes: number }) {
    console.log('liked llega a list');
    
    const userString = localStorage.getItem('currentUser');
    const currentUser = userString ? JSON.parse(userString) : null;
  
    const post = this.posts.find(p => p.id === data.id);
    if (!post || !currentUser) return;
  
    post.isLiked = data.isLiked;
    post.countLikes = data.countLikes;
  
    if (data.isLiked) {
      if (!this.userLikes.includes(data.id)) {
        this.userLikes.push(data.id);
      }
    } else {
      this.userLikes = this.userLikes.filter(id => id !== data.id);
    }
  }
  

  onPostDeleted(postId: number) {
    if(this.pagination && this.pagination.total_count%10 == 1){
      this.pagination.total_pages -= 1;
    }
    if(this.pagination && this.pagination.current_page >1){
      location.reload();
      return;
    }
    if (this.pagination) {this.pagination.total_count -= 1;}
    this.posts = this.posts.filter(post => post.id !== postId);
  }
  
  onPostEdit(){
    const userString = localStorage.getItem("currentUser");
    if(userString){ 
      this.postService.getAllPosts(this.pagination?.current_page).subscribe(response => {
        this.pagination = response.pagination;
        this.posts = this.mapPostsForAuthenticated(response.results, JSON.parse(userString), this.userLikes)
        return;
      });
    }
  }

  onPostCreate(){
    const userString = localStorage.getItem("currentUser");
    if(userString){ 
      this.postService.getAllPosts(this.pagination?.current_page).subscribe(response => {
        this.pagination = response.pagination;
        this.posts = this.mapPostsForAuthenticated(response.results, JSON.parse(userString), this.userLikes)
        return;
      });
    }
  }
}
