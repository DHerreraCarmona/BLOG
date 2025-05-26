import { Dialog } from '@angular/cdk/dialog';
import { throwError } from 'rxjs';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EventEmitter } from '@angular/core'; // Import EventEmitter

import { PostComponent } from './post.component';
import { LikeService } from '@shared/services/like.service';
import { AuthService } from '@shared/services/auth.service';
import { PostService } from '@shared/services/post.service';
import { DetailComponent } from '../detail/detail.component';
import { CreateEditComponent } from '../createEdit/createEdit.component';
import { NotificationService } from '@shared/notifications/notifications.service';


import { mockLikes, createMockLikes, mockPost, mockUser,
  createAuthServiceMock, createLikeServiceMock, createpostServiceMock,
  createDialogMock, createMockDetailDialogRef, createMockEditDialogRef
} from '@shared/mocks/mocks'

let likesMock: any;
let dialogMock: any; 
let dialogEditRef: any;
let dialogDetailRef: any;
let authServiceMock: any;
let likeServiceMock: any;
let postServiceMock: any;
let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;
  notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['show']);

  beforeEach(async () => {
    likesMock = createMockLikes();
    dialogEditRef = createMockEditDialogRef(); 
    dialogDetailRef = createMockDetailDialogRef();

    dialogMock = createDialogMock();
    dialogMock.__setReturn({
      componentInstance: {
        postEdited: new EventEmitter<void>(),
        postDeleted: new EventEmitter<number>(),
        commentCreated: new EventEmitter<number>(),
        likeClicked: new EventEmitter<void>(),
      },
      closed: new EventEmitter<any>() 
    });

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
        { provide: NotificationService, useValue: notificationServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;
    spyOn(console, 'log');
    spyOn(console, 'error');
    spyOn(component.postLiked, 'emit');
    spyOn(component.postDeleted, 'emit');
    spyOn(component.commentCountUpdated, 'emit');
    spyOn(component.postEdited, 'emit'); 

    component.post = { ...mockPost };

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
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Post deleted successfully', 'success');
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
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Error deleting post', 'error');
  });

  it('should call getPostLikes based on likesLoaded status', () => {
    component.getPostLikes();       
    expect(component.likesLoaded).toBeTrue();

    expect(likeServiceMock.getLikes).toHaveBeenCalledWith(mockPost.id, 1);
    expect(component.likes).toEqual(mockLikes);

    component.getPostLikes();         
    expect(likeServiceMock.getLikes).toHaveBeenCalledTimes(1);
  });

  it('should open Detail post modal', () => {
    dialogMock.__setReturn(dialogDetailRef); 
    component.openDetailModal();

    expect(dialogMock.open).toHaveBeenCalledWith(DetailComponent, jasmine.objectContaining({
      data: { post: component.post }
    }));
  });

  it('should handle giveLike error', fakeAsync(() => {
    likeServiceMock.giveLike.and.returnValue(
      throwError(()=>{
        return { error: 'Like Fail' };
      })
    );
    component.giveLike();
    tick(); 
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Error giving like/dislike to post', 'error');
  }));

  it('should handle commentCreated event', fakeAsync(() => {
    component.post.countComments = 0; 
    dialogMock.__setReturn(dialogDetailRef);
    component.openDetailModal();
    fixture.detectChanges();

    dialogDetailRef.componentInstance.commentCreated.emit(mockPost.id);
    tick(); 
    fixture.detectChanges();

    expect(component.post.countComments).toBe(1);
    expect(component.commentCountUpdated.emit).toHaveBeenCalledWith({ id: mockPost.id, count: 1 }); 
  }));

  it('should handle postDeleted event', fakeAsync(() => {
    dialogMock.__setReturn(dialogDetailRef);
    component.openDetailModal();
    fixture.detectChanges();

    dialogDetailRef.componentInstance.postDeleted.emit(mockPost.id);
    tick(); 
    fixture.detectChanges();

    expect(component.postDeleted.emit).toHaveBeenCalledWith(mockPost.id);
  }));

  it('should handle postEdited event', fakeAsync(() => {
    dialogMock.__setReturn(dialogDetailRef);
    component.openDetailModal();
    fixture.detectChanges();

    dialogDetailRef.componentInstance.postEdited.emit();
    tick(); 
    fixture.detectChanges();

    expect(component.postEdited.emit).toHaveBeenCalled();
  }));

  it('should handle likeClicked event', fakeAsync(() => {
    spyOn(component, 'giveLike').and.callThrough(); 
    dialogMock.__setReturn(dialogDetailRef);
    component.openDetailModal();
    fixture.detectChanges();

    dialogDetailRef.componentInstance.likeClicked.emit();
    tick(); 
    fixture.detectChanges();

    expect(component.giveLike).toHaveBeenCalled();
  }));

  it('should open Edit post modal', () => {
    component.isOwnerOrTeamEdit = true;
    dialogMock.__setReturn(dialogEditRef); 
    component.openEditModal();

    expect(dialogMock.open).toHaveBeenCalledWith(CreateEditComponent, jasmine.objectContaining({
      minWidth: '75%',
      maxWidth: '100%',
      data: {
        postId: component.post.id,
        isCreate: false,
      },
      panelClass: 'Edit-dialog-panel',
    }));
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