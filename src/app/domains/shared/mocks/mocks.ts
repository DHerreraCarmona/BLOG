import { EventEmitter } from "@angular/core";
import { Like } from "@shared/models/like";
import { Pagination } from "@shared/models/pagination";
import { BehaviorSubject, of } from "rxjs";

export const mockClick = new MouseEvent('click');
export const mockLeave = new MouseEvent('mouseleave');

export const mockUser = { id: 1, username: 'testUser', team: 'None' };
export const mockShortUser = { username: 'testUser'};

export const mockPost = {
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

export const mockPagination: Pagination = {
  current_page: 1,
  total_pages: 1,
  total_count: 14,
  first_elem: 1,
  last_elem: 2,
};

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
  }
];


const authStatusSubject = new BehaviorSubject<boolean>(true);
const currentUserSubject = new BehaviorSubject(mockUser);

export function createAuthServiceMock() {
  return {
    authStatus$: authStatusSubject.asObservable(),
    currentUser$: currentUserSubject.asObservable(),
    getUser: jasmine.createSpy().and.returnValue({ username: 'testUser' }),
  }
};

export function createLikeServiceMock(){
  return {
    giveLike: jasmine.createSpy().and.returnValue(of({})),
    getLikes: jasmine.createSpy().and.returnValue(of({ results: mockLikes, pagination: mockPagination })),
  }
};

export function createpostServiceMock() {
  return {
    deletePost: jasmine.createSpy().and.returnValue(of({ success: true })),
  }
};

export function createDialogMock() {
  return {
    open: jasmine.createSpy().and.returnValue({
      componentInstance: {
        commentCreated: new EventEmitter<number>(),
      },
    })
  }
};

export function createMockDialogRef() {
  return {
    close: jasmine.createSpy('close'),
  }

};
