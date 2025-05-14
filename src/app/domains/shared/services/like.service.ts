import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {environment} from '@env/enviroments.prod'
import { Like } from '@shared/models/like';
import { Pagination } from '@shared/models/pagination';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = environment.API_URL;

  constructor(
    private http: HttpClient
  ) { }

  getLikes(postId: number,page:number=1): Observable<{pagination:Pagination;results: Like[]}>{
    return this.http.get<{pagination:Pagination;results: Like[]}>
    (`${this.apiUrl}likes/post/${postId}/?page=${page}`)
  }

  getLikesByUser(userId: number): Observable<number[]> {
    return this.http.get<Like[]>(`${this.apiUrl}likes/author/${userId}/`,).pipe(
      map(response => response.map(like => like.post.id)),
    );
  }

  giveLike(postId:number){
    return this.http.post(this.apiUrl + `post/${postId}/give-like/`, {});
  }
}
