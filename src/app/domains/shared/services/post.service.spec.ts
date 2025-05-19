import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PostService } from './post.service';
import { environment } from '@env/enviroments.prod';
import { Post,PostDetail,PostEditCreate,} from '@shared/models/post';
import { Pagination } from '@shared/models/pagination';


describe('ProductService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all posts with pagination', () => {
    service.getAllPosts(1).subscribe(response => {
      expect(response.pagination).toEqual(mockPagination);
      expect(response.results.length).toBe(2);
      expect(response.results[0].title).toBe('Post 1');
    });

    const req = httpMock.expectOne(`${environment.API_URL}post/?page=1`);
    expect(req.request.method).toBe('GET');

    req.flush({ pagination: mockPagination, results: mockPosts });
  });
  
  it('should fetch post detail', () => {
    service.getPostDetail(1).subscribe(response => {
      expect(response.id).toBe(1);
      expect(response.title).toBe('Post 1');
    })

    const req = httpMock.expectOne(`${environment.API_URL}post/1/`);
    expect(req.request.method).toBe('GET');

    req.flush(mockPosts[0]);
  });

  it('should create a new post', () => {
    service.createPost(createEditPost).subscribe(response=>{
      expect(response.id).toBe(3);
      expect(response.title).toBe('post 3');
      expect(service.createPost).toHaveBeenCalledWith(createEditPost);
      expect(service.createPost).toHaveBeenCalledTimes(1);
      expect(response).toEqual(createEditPost);
    })

    const req = httpMock.expectOne(`${environment.API_URL}post/create/`);
    expect(req.request.method).toBe('POST');

    req.flush(createEditPost);
  });



  
  
  
});




const mockPosts: Post[] = [
  {
    id: 1,
    author: { id: 1, username: 'john',team: 'None' },
    title: 'Post 1',
    excerpt: 'Excerpt 1',
    created_at: '2024-01-01T00:00:00Z',
    countComments: 5,
    countLikes: 10,
    teamEdit: false
  },
  {
    id: 2,
    author: { id: 2, username: 'jane',team: 'None' },
    title: 'Post 2',
    excerpt: 'Excerpt 2',
    created_at: '2024-01-02T00:00:00Z',
    countComments: 2,
    countLikes: 3,
    teamEdit: true
  }
];

const mockPagination: Pagination = {
  current_page: 1,
  total_pages: 3,
  total_count: 6,
  first_elem:1,
  last_elem:2
};

const createEditPost: PostEditCreate ={
  id: 3,
  author: {username: 'john'},
  title: 'post 3',
  content: 'content 3',
  public: 0,
  authenticated: 1,
  team: 1,
  owner:1
}