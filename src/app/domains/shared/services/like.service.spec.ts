import { TestBed } from '@angular/core/testing';
import {HttpClientTestingModule,HttpTestingController,} from '@angular/common/http/testing';

import { Like } from '@shared/models/like';
import { LikeService } from './like.service';
import { environment } from '@env/enviroments.prod';
import { Pagination } from '@shared/models/pagination';

describe('LikeService', () => {
  let service: LikeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(LikeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch likes with pagination', () => {
    service.getLikes(1, 1).subscribe((response) => {
      expect(response).toEqual({
        pagination: mockPagination,
        results: mockLikes,
      });
    });

    const req = httpMock.expectOne(`${environment.API_URL}likes/post/1/?page=1`);
    req.flush({ pagination: mockPagination, results: mockLikes });

    expect(req.request.method).toBe('GET');
  });

  it('should handle error when post is not found', () => {
    service.getLikes(23, 1).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.API_URL}likes/post/23/?page=1`);
    req.flush({ message: 'Not found' },{ status: 404, statusText: 'Not Found' });
  });

  it('should fetch likes by user', () => {
    service.getLikesByUser(1).subscribe((response) => {
      expect(response).toEqual([1, 2]);
    });

    const req = httpMock.expectOne(`${environment.API_URL}likes/author/1/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLikes);
  });

  it('should handle error when user is not found', () => {
    service.getLikesByUser(23).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.API_URL}likes/author/23/`);
    req.flush({ message: 'Not found' },{ status: 404, statusText: 'Not Found' });
  });

  it('should give like to a post', () => {
    service.giveLike(1).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.API_URL}post/1/give-like/`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should handle error when giving like to a post that does not exist', () => {
    service.giveLike(23).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.API_URL}post/23/give-like/`);
    req.flush({ message: 'Not found' },{ status: 404, statusText: 'Not Found' });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

const mockPagination: Pagination = {
  current_page: 1,
  total_pages: 1,
  total_count: 2,
  first_elem: 1,
  last_elem: 2,
};

const mockLikes: Like[] = [
  {
    post: { id: 1, title: 'post 1' },
    author: { username: 'john' },
  },
  {
    post: { id: 2, title: 'post 2' },
    author: { username: 'jane' },
  },
];
