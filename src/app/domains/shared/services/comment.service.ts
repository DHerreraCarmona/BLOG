import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '@env/enviroments.prod';
import { Pagination } from '@shared/models/pagination';
import { Comment, createCommentModel } from '@shared/models/comment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private url = environment.API_URL;

  constructor(private http: HttpClient) {}

  getComments(id: number, page: number = 1): Observable<{ pagination: Pagination; results: Comment[] }> {
    return this.http.get<{ pagination: Pagination; results: Comment[] }>(
      this.url + `comments/post/${id}/?page=${page}`
    );
  }

  postComment(id: number, data: createCommentModel) {
    return this.http.post<Comment>(this.url + `post/${id}/write-comment/`,data);
  }
}
