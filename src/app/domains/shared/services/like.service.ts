import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {environment} from '@env/enviroments.prod'
import { Like } from '@shared/models/like';
import { catchError, map, Observable, of, tap } from 'rxjs';

interface LikeResponse {
  results: {
    post: {
      id: number;
      title: string;
    };
    author: {
      username: string;
    };
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = environment.API_URL;

  constructor(
    private http: HttpClient
  ) { }

  getLikes(postId: number): Observable<{results: Like[]}> {
    return this.http.get<{results: Like[]}>(`${this.apiUrl}post/${postId}/likes`)
  }

  getLikesByUser(userId: number): Observable<number[]> {
    return this.http.get<LikeResponse>(`${this.apiUrl}likes/author/${userId}/`,
    ).pipe(
      map(res => res.results.map(like => like.post.id)),
    );
  }

  giveLike(postId:number){
    return this.http.post(this.apiUrl + `post/${postId}/give-like/`, {});
  }
}
