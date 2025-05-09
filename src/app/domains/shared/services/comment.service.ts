import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {environment} from '@env/enviroments.prod'
import { Comment, createCommentModel } from '@shared/models/comment';


@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private url = environment.API_URL;

  constructor(
    private http: HttpClient
  ) { }

  getComments(id: number){
    return this.http.get<Comment[]>(this.url + `post/${id}/comments/`);
  }

  postComment(id:number, data: createCommentModel){
    return this.http.post<Comment>(this.url + `post/${id}/write-comment/`, data);
  }
}