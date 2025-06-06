import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/enviroments.prod';
import { Post, PostDetail, PostEditCreate } from '@shared/models/post';
import { Pagination } from '@shared/models/pagination';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  getAllPosts(page: number = 1): Observable<{ pagination: Pagination; results: Post[] }> {
    return this.http.get<{ pagination: Pagination; results: Post[] }>(
      `${this.apiUrl}post/?page=${page}`
    );
  }

  getPostDetail(postId: number) {
    return this.http.get<PostDetail>(this.apiUrl + `post/${postId}/`);
  }

  createPost(data: PostEditCreate) {
    return this.http.post<PostEditCreate>(this.apiUrl + 'post/create/', data);
  }

  getEditPost(postId: number) {
    return this.http.get<PostEditCreate>(this.apiUrl + `blog/${postId}/`);
  }

  postEditPost(data: PostEditCreate) {
    return this.http.put<PostEditCreate>(this.apiUrl + `blog/${data.id}/`, data);
  }

  deletePost(id: number) {
    return this.http.delete(this.apiUrl + `post/${id}/`);
  }
}
