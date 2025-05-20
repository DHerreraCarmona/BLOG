import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Comment } from '@shared/models/comment';
import { CommentService } from './comment.service';
import { environment } from '@env/enviroments.prod';
import { Pagination } from '@shared/models/pagination';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch comments with pagination', () => {
    service.getComments(1, 1).subscribe((response) => {
      expect(response).toEqual({
        pagination: mockPagination,
        results: mockComments,
      });
    });

    const req = httpMock.expectOne(`${environment.API_URL}comments/post/1/?page=1`);
    expect(req.request.method).toBe('GET');

    req.flush({ pagination: mockPagination, results: mockComments });
  });

  it('should handle error when post is not found', () => {
    service.getComments(23, 1).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(`${environment.API_URL}comments/post/23/?page=1`);
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
  });

  it('should create new commemt', () => {
    service.postComment(1, {
        author: mockComments[0].author,
        content: mockComments[0].content,
      })
      .subscribe((response) => {
        expect(response).toEqual(mockComments[0]);
      });

    const req = httpMock.expectOne(`${environment.API_URL}post/1/write-comment/`);
    expect(req.request.method).toBe('POST');
    req.flush(mockComments[0]);
  });

  it('should handle comment error when post is not found', () => {
    service.postComment(23, {
        author: mockComments[0].author,
        content: mockComments[0].content,
      })
      .subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

    const req = httpMock.expectOne(`${environment.API_URL}post/23/write-comment/`);
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

const mockComments: Comment[] = [
  {
    author: { username: 'john' },
    content: 'comment 1',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    author: { username: 'jane' },
    content: 'comment 2',
    created_at: '2025-02-01T00:00:00Z',
  },
];
