import { EventEmitter } from '@angular/core';
import { Comment, createCommentModel } from '@shared/models/comment';
import { Like } from '@shared/models/like';
import { Pagination } from '@shared/models/pagination';
import { Post, PostDetail, PostEditCreate } from '@shared/models/post';
import { BehaviorSubject, of } from 'rxjs';

export const mockClick = new MouseEvent('click');
export const mockLeave = new MouseEvent('mouseleave');

export const mockUser = { id: 1, username: 'testUser', team: 'None' };
export const mockShortUser = { username: 'testUser' };

export const mockPost: Post = {
  id: 1,
  title: 'Test Post',
  countLikes: 0,
  isLiked: false,
  author: { id: 1, username: 'testUser', team: 'None' },
  excerpt: '',
  created_at: '',
  countComments: 0,
  teamEdit: false,
};

export const mockPostDetail: PostDetail = {
  id: 1,
  author: { id: 1, username: 'testUser', team: 'None' },
  title: 'Detail Test Post',
  content: 'Detail Test Post contetn',
  created_at: '',
  countLikes: 0,
  isLiked: false,
  countComments: 0,
}

export const mockEditPost: PostEditCreate = {
  id: 1,
  author: { username: 'john' },
  title: 'Create Edit post',
  content: 'Create Edit Post content',
  public: 1,
  authenticated: 1,
  team: 2,
  owner:2,
};

export const mockPagination: Pagination = {
  current_page: 1,
  total_pages: 1,
  total_count: 2,
  first_elem: 1,
  last_elem: 2,
};

export const mockComments: Comment[] = [
  {
    author: { username: 'john' },
    content: 'comment 1',
    created_at: '2025-10-01T00:00:00Z',
  },
  {
    author: { username: 'john' },
    content: 'comment 2',
    created_at: '2025-10-01T00:00:00Z',
  },
  {
    author: { username: 'john' },
    content: 'comment 3',
    created_at: '2025-10-01T00:00:00Z',
  },
  {
    author: { username: 'john' },
    content: 'comment 4',
    created_at: '2025-10-01T00:00:00Z',
  },
];

export const mockNewComment: createCommentModel = {
  author: { username: 'testUser' },
  content: 'Create comment 1',
};

export function createMockLikes(): Like[] {
  return [...mockLikes];
}

const authStatusSubject = new BehaviorSubject<boolean>(true);
const currentUserSubject = new BehaviorSubject(mockUser);

export function createAuthServiceMock() {
  return {
    authStatus$: authStatusSubject.asObservable(),
    currentUser$: currentUserSubject.asObservable(),
    fetchCsrf: jasmine.createSpy().and.returnValue(of({})),
    getUser: jasmine.createSpy().and.returnValue({ username: 'testUser' }),
  };
}

export function createLikeServiceMock(likes: Like[]) {
  return {
    giveLike: jasmine.createSpy().and.returnValue(of({})),
    getLikes: jasmine
      .createSpy()
      .and.returnValue(
        of({ results: [...mockLikes], pagination: mockPagination })
      ),
  };
}

export function createCommentServiceMock() {
  return {
    postComment: jasmine.createSpy().and.returnValue(of({})),
    getComments: jasmine
      .createSpy()
      .and.returnValue(
        of({ results: mockComments, pagination: mockPagination })
      ),
  };
}

export function createpostServiceMock() {
  return {
    createPost: jasmine.createSpy().and.returnValue(of(mockEditPost)),
    getEditPost: jasmine.createSpy().and.returnValue(of(mockEditPost)),
    postEditPost: jasmine.createSpy().and.returnValue(of(mockEditPost)),
    getPostDetail: jasmine.createSpy().and.returnValue(of(mockPostDetail)),
    deletePost: jasmine.createSpy().and.returnValue(of({ success: true })),
  };
}

export function createMockDetailDialogRef() {
  return {
    componentInstance: {
      postEdited: new EventEmitter<number>(),
      postDeleted: new EventEmitter<number>(),
      commentCreated: new EventEmitter<number>(),
      likeClicked: new EventEmitter<void>(),
    },
  };
}

export function createMockEditDialogRef() {
  return {
    componentInstance: {
      postEdited: new EventEmitter<number>(),
      postCreated: new EventEmitter<number>(),
    },
  };
}

export function createDialogMock(dialogRef: any) {
  return {
    open: jasmine.createSpy().and.returnValue(dialogRef),
  };
}

export function createMockDialogRef() {
  return {
    close: jasmine.createSpy('close'),
  };
}


export const mockLikes: Like[] = [
  {
    post: { id: 1, title: 'post 1' },
    author: { username: 'john' },
  },
  {
    post: { id: 2, title: 'post 1' },
    author: { username: 'jane' },
  },
  {
    post: { id: 1, title: 'post 1' },
    author: { username: 'john' },
  },
  {
    post: { id: 2, title: 'post 1' },
    author: { username: 'jane' },
  },
  {
    post: { id: 1, title: 'post 1' },
    author: { username: 'john' },
  },
  {
    post: { id: 2, title: 'post 1' },
    author: { username: 'jane' },
  },
  {
    post: { id: 1, title: 'post 1' },
    author: { username: 'john' },
  },
  {
    post: { id: 2, title: 'post 1' },
    author: { username: 'jane' },
  },
  {
    post: { id: 1, title: 'post 1' },
    author: { username: 'john' },
  },
  {
    post: { id: 2, title: 'post 1' },
    author: { username: 'jane' },
  },
  {
    post: { id: 1, title: 'post 1' },
    author: { username: 'john' },
  },
  {
    post: { id: 2, title: 'post 1' },
    author: { username: 'jane' },
  },
  {
    post: { id: 1, title: 'post 1' },
    author: { username: 'john' },
  },
  {
    post: { id: 2, title: 'post 1' },
    author: { username: 'jane' },
  },
];