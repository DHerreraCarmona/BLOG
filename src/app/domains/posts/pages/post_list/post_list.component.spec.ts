import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PostListComponent } from './post_list.component';

import { PostService } from '@shared/services/post.service';
import { AuthService } from '@shared/services/auth.service';
import { LikeService } from '@shared/services/like.service';
import { NotificationService } from '@shared/notifications/notifications.service';

import {
  mockPost,
  mockPagination,
  mockUser,
  mockLikes,
  createpostServiceMock,
  createAuthServiceMock,
  createLikeServiceMock,
} from '@shared/mocks/mocks';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let fixture: ComponentFixture<PostListComponent>;
  let postServiceMock: any;
  let authServiceMock: any;
  let likeServiceMock: any;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    postServiceMock = createpostServiceMock();
    authServiceMock = createAuthServiceMock();
    likeServiceMock = createLikeServiceMock(mockLikes);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['show']);

    await TestBed.configureTestingModule({
      imports: [PostListComponent],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LikeService, useValue: likeServiceMock },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load posts for unauthenticated users', () => {
    authServiceMock.__setAuthStatus(false);
    spyOn(component, 'loadPosts').and.callThrough();

    expect(postServiceMock.getAllPosts).toHaveBeenCalled();
  });

  it('should load posts and likes for authenticated users', () => {
    authServiceMock.__setAuthStatus(true);
    authServiceMock.__setCurrentUser(mockUser);
    spyOn(component, 'loadPosts').and.callThrough();

    expect(postServiceMock.getAllPosts).toHaveBeenCalled();
  });

  it('should show error message on load failure', () => {
    postServiceMock.getAllPosts.and.returnValue(throwError(() => new Error('Load failed')));
    authServiceMock.__setAuthStatus(false);

    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Error loading posts', 'error');
  });

  it('should reload posts onPostDeleted', () => {
    component.pagination = { ...mockPagination, current_page: 1 };
    component.onPostDeleted();

    expect(postServiceMock.getAllPosts).toHaveBeenCalledWith(1);
  });

  it('should reload posts onPostEdited', () => {
    component.pagination = { ...mockPagination, current_page: 1 };
    component.onPostEdit();

    expect(postServiceMock.getAllPosts).toHaveBeenCalledWith(1);
  });

  it('should reload posts onPostCreated', () => {
    component.pagination = { ...mockPagination, current_page: 1 };
    component.onPostCreate();

    expect(postServiceMock.getAllPosts).toHaveBeenCalledWith(1);
  });

  it('should update like info on onPostLiked', () => {
    component.posts = [ { ...mockPost, id: 1, countLikes: 0, isLiked: false } ];
    component.userLikes = [];

    component.onPostLiked({ id: 1, isLiked: true, countLikes: 10 });

    expect(component.posts[0].isLiked).toBeTrue();
    expect(component.posts[0].countLikes).toBe(10);
    expect(component.userLikes).toContain(1);
  });

  it('should remove like info on unlike in onPostLiked', () => {
    component.posts = [ { ...mockPost, id: 1, countLikes: 5, isLiked: true } ];
    component.userLikes = [1];

    component.onPostLiked({ id: 1, isLiked: false, countLikes: 4 });

    expect(component.posts[0].isLiked).toBeFalse();
    expect(component.posts[0].countLikes).toBe(4);
    expect(component.userLikes).not.toContain(1);
  });

  it('should call loadPosts with valid page on paginated()', () => {
    component.pagination = { ...mockPagination, current_page: 1 };
    component.paginated(1);

    expect(postServiceMock.getAllPosts).toHaveBeenCalledWith(1);
  });

   it('should not call loadPosts on paginated() with invalid page', () => {
    component.pagination = { ...mockPagination, current_page: 1 };

    const spy = spyOn(component, 'loadPosts');

    component.paginated(0);
    component.paginated(100);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not call loadPosts on paginated() if pagination is null', () => {
    component.pagination = null;

    const spy = spyOn(component, 'loadPosts');

    component.paginated(1);

    expect(spy).not.toHaveBeenCalled();
  });
});
