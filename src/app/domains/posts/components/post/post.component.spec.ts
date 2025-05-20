import { BehaviorSubject, of } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Like } from '@shared/models/like';
import { PostComponent } from './post.component';
import { Pagination } from '@shared/models/pagination';
import { LikeService } from '@shared/services/like.service'; 
import { AuthService  } from '@shared/services/auth.service';
import { PostService  } from '@shared/services/post.service'; 

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;
  
  let dialogMock: any;
  let authServiceMock: any;
  let postServiceMock: any;
  let likeServiceMock: any;
  
  beforeEach(async () => {
    const authStatusSubject = new BehaviorSubject<boolean>(true);
    const currentUserSubject = new BehaviorSubject(mockUser);

    authServiceMock = {
      authStatus$: authStatusSubject.asObservable(),
      currentUser$: currentUserSubject.asObservable(),
      getUser: jasmine.createSpy().and.returnValue({ username: 'testUser' }),
    };

    likeServiceMock = {
      getLikes: jasmine.createSpy().and.returnValue(of({ results: mockLikes, pagination: mockPagination })),
      giveLike: jasmine.createSpy().and.returnValue(of({})),
    };

    postServiceMock = {
      deletePost: jasmine.createSpy().and.returnValue(of({ success: true })),
    };

    dialogMock = {
      open: jasmine.createSpy().and.returnValue({
        componentInstance: {
          commentCreated: new EventEmitter<number>(),
        },
      }),
    };

    await TestBed.configureTestingModule({
      imports: [PostComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: LikeService, useValue: likeServiceMock },
        { provide: PostService, useValue: postServiceMock },
        { provide: Dialog, useValue: dialogMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;
    spyOn(console, 'log');
    spyOn(console, 'error');
    spyOn(component.postLiked, 'emit');
    spyOn(component.postDeleted, 'emit');

    component.post = mockPost;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct values', () => {
    expect(component.isAuth).toBe(true);
    expect(component.currentUserId).toBe(1);
    expect(component.user).toEqual(mockUser);
    expect(component.isOwnerOrTeamEdit).toBe(false);
    expect(component.post).toEqual(mockPost);
  });

  it('should call getPostLikes depend on likesLoaded status', () => {
    component.getPostLikes();        //likesLoaded is False, call service
    expect(component.likesLoaded).toBeTrue;

    expect(likeServiceMock.getLikes).toHaveBeenCalledWith(mockPost.id, 1);
    expect(component.likes).toEqual(mockLikes);

    component.getPostLikes();         //likesLoaded is True, dont call service again
    expect(likeServiceMock.getLikes).toHaveBeenCalledTimes(1);
  });


  

});

const mockUser = { id: 1, username: 'testUser', team: 'None' };

const mockPost = {
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