import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {environment} from '@env/enviroments.prod'
import { Post} from '@shared/models/post';
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
  
  getPost(id: number){
    return this.http.get<Post>(this.apiUrl + `post/${id}/`);
  }

  createPost(data: Post){
    return this.http.post<Post>(this.apiUrl + 'post/create/', data);
  }

  deletePost(id:number){
    return this.http.delete(this.apiUrl + `post/${id}/`);
  }
}
