import { BehaviorSubject, of, throwError } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Dialog, DialogRef,DIALOG_DATA } from '@angular/cdk/dialog';

import { DetailComponent } from './detail.component';
import { AuthService } from '@shared/services/auth.service';
import { LikeService } from '@shared/services/like.service';
import { PostService } from '@shared/services/post.service';
import { CommentService } from '@shared/services/comment.service';
import { mockClick,mockLeave,mockLikes,mockComments,mockPost,mockPagination,mockShortUser,
  createAuthServiceMock,createLikeServiceMock,createCommentServiceMock,createpostServiceMock,
  createDialogMock,createMockDialogRef
} from '@shared/mocks/mocks'

let dialogMock: any;
let mockDialogRef: any;
let authServiceMock: any;
let postServiceMock: any;
let likeServiceMock: any;
let commentServiceMock: any;

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  beforeEach(async () => {
    dialogMock = createDialogMock();
    mockDialogRef = createMockDialogRef();
    authServiceMock = createAuthServiceMock();
    likeServiceMock = createLikeServiceMock();
    commentServiceMock = createCommentServiceMock();
    postServiceMock = createpostServiceMock();

    await TestBed.configureTestingModule({
      imports: [DetailComponent,HttpClientTestingModule],
      providers: [
        // { provide: Dialog, useValue: dialogMock },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LikeService, useValue: likeServiceMock },
        { provide: CommentService, useValue: commentServiceMock },
        { provide: PostService, useValue: postServiceMock },
        { provide: DIALOG_DATA, useValue: { post: mockPost }},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    spyOn(console, 'log');
    spyOn(console, 'error');
    spyOn(component.postLiked, 'emit');
    spyOn(component.commentCreated, 'emit');

    component.post = mockPost;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the component', () => {
    expect(component.isAuth).toBe(true);
    expect(component.user).toEqual(mockShortUser);
    expect(component.isOwnerOrTeamEdit).toBe(false);

    expect(component.post).toEqual(mockPost);
    expect(component.form).toBeDefined();
    expect(component.form.value).toEqual({ content: '' });

    expect(component.likes).toBe(mockLikes);
    expect(likeServiceMock.getLikes).toHaveBeenCalled();
    
    expect(component.comments).toBe(mockComments);
    expect(commentServiceMock.getComments).toHaveBeenCalled();
  });

  // it('should call deletePost and emit postDeleted', () => {
  //     component.deletePost();
  //     expect(component.isDeleteViewOpen).toBeFalse();
  //     expect(postServiceMock.deletePost).toHaveBeenCalledWith(mockPost.id);
  //     expect(component.postDeleted.emit).toHaveBeenCalledWith(mockPost.id);
  //     expect(console.log).toHaveBeenCalledOnceWith('Post deleted successfully', { success: true });
  // });

  // it('should handle deletePost error', () => {
  //   postServiceMock.deletePost.and.returnValue(
  //     throwError(()=>{
  //       return { error: 'Delete Fail' };
  //     })
  //   )
  //   component.deletePost();
  //   expect(component.isDeleteViewOpen).toBeFalse();
  //   expect(component.postDeleted.emit).not.toHaveBeenCalled();
  //   expect(postServiceMock.deletePost).toHaveBeenCalledWith(mockPost.id);
  //   expect(console.error).toHaveBeenCalledOnceWith('Error deleting post', { error: 'Delete Fail'});
  // });









});
