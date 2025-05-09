import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {environment} from '@env/enviroments.prod'
import { Post,PostDetail,PostEditCreate} from '@shared/models/post';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiUrl = environment.API_URL;

  constructor(
    private http: HttpClient
  ) { }

  getAllPosts(): Observable<{ results: Post[] }> {
    return this.http.get<{ results: Post[] }>(`${this.apiUrl}post/`,
    );
  }
  
  getPostDetail(id: number){
    return this.http.get<PostDetail>(this.apiUrl + `post/${id}/`);
  }

  createPost(data: PostEditCreate){
    return this.http.post<PostEditCreate>(this.apiUrl + 'post/create/', data);
  }

  getEditPost(postId: number){
    return this.http.get<PostEditCreate>(this.apiUrl + `blog/${postId}/`);
  }

  postEditPost(data: PostEditCreate){
    return this.http.put<PostEditCreate>(this.apiUrl + `blog/${data.id}/`, data);
  }

  deletePost(id:number){
    return this.http.delete(this.apiUrl + `post/${id}/`);
  }
}
