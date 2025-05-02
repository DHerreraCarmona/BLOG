import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {environment} from '@env/enviroments.prod'
import { Like } from '@shared/models/like';


@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private url = environment.API_URL;

  constructor(
    private http: HttpClient
  ) { }

  getLikes(id: number){
    return this.http.get(this.url + `post/${id}/likes`,
      { withCredentials: true});
  }

  giveLike(id:number){
    return this.http.post(this.url + `post/${id}/give-like`, {},
      { withCredentials: true});
  }
}
