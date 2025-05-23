import { Dialog } from '@angular/cdk/dialog';
import { throwError } from 'rxjs';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { PostComponent } from './post.component';
import { LikeService } from '@shared/services/like.service'; 
import { AuthService  } from '@shared/services/auth.service';
import { PostService  } from '@shared/services/post.service'; 
import { DetailComponent } from '../detail/detail.component';
import { CreateEditComponent } from '../createEdit/createEdit.component';

import { mockClick,mockLeave,mockLikes,createMockLikes,mockPost,mockPagination,mockUser,
  createAuthServiceMock,createLikeServiceMock,createpostServiceMock,
  createDialogMock, createMockDetailDialogRef
} from '@shared/mocks/mocks'

let likesMock: any; 
let dialogRef: any;
let dialogMock: any;
let authServiceMock: any;
let likeServiceMock: any;
let postServiceMock: any;

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;
  
  beforeEach(async () => {
    likesMock = createMockLikes(); 
    dialogRef = createMockDetailDialogRef();
    dialogMock = createDialogMock(dialogRef);
    authServiceMock = createAuthServiceMock();
    postServiceMock = createpostServiceMock();
    likeServiceMock = createLikeServiceMock(likesMock);

    await TestBed.configureTestingModule({
      imports: [PostComponent],
      providers: [
        { provide: Dialog, useValue: dialogMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LikeService, useValue: likeServiceMock },
        { provide: PostService, useValue: postServiceMock },
      ]
    }).compileComponents();

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

  it('should call deletePost and emit postDeleted', () => {
    component.deletePost();
    expect(component.isDeleteViewOpen).toBeFalse();
    expect(postServiceMock.deletePost).toHaveBeenCalledWith(mockPost.id);
    expect(component.postDeleted.emit).toHaveBeenCalledWith(mockPost.id);
    expect(console.log).toHaveBeenCalledOnceWith('Post deleted successfully', { success: true });
  });

  it('should handle deletePost error', () => {
    postServiceMock.deletePost.and.returnValue(
      throwError(()=>{
        return { error: 'Delete Fail' };
      })
    )
    component.deletePost();
    expect(component.isDeleteViewOpen).toBeFalse();
    expect(component.postDeleted.emit).not.toHaveBeenCalled();
    expect(postServiceMock.deletePost).toHaveBeenCalledWith(mockPost.id);
    expect(console.error).toHaveBeenCalledOnceWith('Error deleting post', { error: 'Delete Fail'});
  });

  it('should call getPostLikes based on likesLoaded status', () => {
    component.getPostLikes();        //likesLoaded is False, call service
    expect(component.likesLoaded).toBeTrue;

    expect(likeServiceMock.getLikes).toHaveBeenCalledWith(mockPost.id, 1);
    expect(component.likes).toEqual(mockLikes);

    component.getPostLikes();         //likesLoaded is True, dont call service again
    expect(likeServiceMock.getLikes).toHaveBeenCalledTimes(1);
  });

  it('should call giveLike and emit postLiked for like and dislike', () => {
    component.post.isLiked = false;
    component.post.countLikes = mockLikes.length;

    component.giveLike();

    expect(component.post.isLiked).toBeTrue();
    expect(component.post.countLikes).toBe(mockLikes.length + 1);
    expect(likeServiceMock.giveLike).toHaveBeenCalledWith(mockPost.id);
    expect(component.postLiked.emit).toHaveBeenCalledWith(mockPost.id);

    component.giveLike();
    expect(component.post.isLiked).toBeFalse();
    expect(component.post.countLikes).toBe(mockLikes.length);
    expect(likeServiceMock.giveLike).toHaveBeenCalledTimes(2);
    expect(component.postLiked.emit).toHaveBeenCalledTimes(2);
  });

  it('should handle giveLike error', () => {
    component.post.countLikes = mockLikes.length;
    likeServiceMock.giveLike.and.returnValue(
      throwError(()=>{
        return { error: 'internal error'};
      })
    );

    component.giveLike();
    expect(component.post.isLiked).toBeFalse();
    expect(component.postLiked.emit).not.toHaveBeenCalled();
    expect(component.post.countLikes).toBe(mockLikes.length);
    expect(likeServiceMock.giveLike).toHaveBeenCalledWith(mockPost.id);
    expect(console.error).toHaveBeenCalledOnceWith('Giving like/dislike error', { error: 'internal error'});
  });
  
  it('should handle likes pagination correctly', () => {
    spyOn(component, 'getPostLikes').and.callThrough();

    component.likes = mockLikes;
    component.likesPag = mockPagination;

    component.likes.push({
      post: { id: 1, title: 'post 1' },
      author: { username: 'john' },
    });

    component.post.isLiked = false;
    component.post.countLikes = component.likes.length;

    expect(component.likes.length).toBe(15);

    component.giveLike();
    expect(component.getPostLikes).toHaveBeenCalledTimes(1);

    component.likes = [{
      post: { id: 1, title: 'post 1' },
      author: { username: 'john' },
    }];
    component.likesPag.current_page = 2;

    component.giveLike();
    expect(component.getPostLikes).toHaveBeenCalledWith(1);
    
  });

  it('should open and close likes overlay and call getPostLikes', () => {
    spyOn(mockClick, 'stopPropagation');
    spyOn(component, 'getPostLikes');
    spyOn(component, 'clearCloseTimeout');

    component.toggleLikesOverlay(mockClick);
    expect(component.isLikesOverlayOpen).toBeTrue();
    expect(component.getPostLikes).toHaveBeenCalled();
    expect(mockClick.stopPropagation).toHaveBeenCalled();
    expect(component.clearCloseTimeout).toHaveBeenCalledTimes(1);

    component.toggleLikesOverlay(mockLeave);
    expect(component.isLikesOverlayOpen).toBeFalse();
    expect(component.clearCloseTimeout).toHaveBeenCalledTimes(2);
  });

  it('should open edit post modal',()=>{
    const mockDialogRef = {
      componentInstance: {postId: null}
    };
    dialogMock.open.and.returnValue(mockDialogRef);

    component.openEditModal();

    expect(dialogMock.open).toHaveBeenCalled();
    expect(dialogMock.open).toHaveBeenCalledWith(CreateEditComponent, {
      minWidth: '75%',
      maxWidth: '100%',
      data: {
        postId: component.post.id,
        isCreate: false,
      },
      panelClass: 'Edit-dialog-panel',
    });
  })

  it('should open Detail post modal', () => {
    component.openDetailModal();

    expect(dialogMock.open).toHaveBeenCalledWith(DetailComponent, jasmine.objectContaining({
      data: { post: component.post }
    }));
  });

  it('should handle commentCreated event', () => {
    component.openDetailModal();
    dialogRef.componentInstance.commentCreated.emit(mockPost.id);

    expect(component.post.countComments).toBe(1);
  });

  it('should handle postDeleted event', () => {
    component.openDetailModal();
    dialogRef.componentInstance.postDeleted.emit(mockPost.id);

    expect(component.postDeleted.emit).toHaveBeenCalledWith(mockPost.id);
  });
  
  it('should handle close timeout correctly', () => {
    component.startCloseTimeout();
    expect(component.closeTimeoutId).not.toBeNull();

    component.clearCloseTimeout();
    expect(component.closeTimeoutId).toBeNull();
  });

  it('should close likes overlay after timeout', fakeAsync(() => {
    component.isLikesOverlayOpen = true;
    component.startCloseTimeout();
    tick(component.closeDelay);
    expect(component.isLikesOverlayOpen).toBeFalse();
  }));

  it('should unsubscribe on destroy', () => {
    const spy = spyOn(component['authSubscription']!, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
  
});

