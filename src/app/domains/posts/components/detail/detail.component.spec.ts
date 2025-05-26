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
import { NotificationService } from '@shared/notifications/notifications.service';
import { mockPost,mockPostDetail,mockLikes,createMockLikes,mockComments,mockNewComment,mockPagination,mockShortUser,
  createAuthServiceMock,createLikeServiceMock,createCommentServiceMock,createpostServiceMock,
  createDialogMock,createMockDialogRef,
  createMockEditDialogRef
} from '@shared/mocks/mocks'

let likesMock: any;
let dialogRef: any;
let dialogMock: any;
let dialogEditRef: any;
let authServiceMock: any;
let postServiceMock: any;
let likeServiceMock: any;
let commentServiceMock: any;
let notificationServiceSpy: jasmine.SpyObj<NotificationService>;


describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  
  
  beforeEach(async () => {
    likesMock = createMockLikes(); 
    dialogRef = createMockDialogRef();
    dialogMock = createDialogMock();
    authServiceMock = createAuthServiceMock();
    postServiceMock = createpostServiceMock();
    dialogEditRef = createMockEditDialogRef(); 
    commentServiceMock = createCommentServiceMock();
    likeServiceMock = createLikeServiceMock(likesMock);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['show']);

    dialogMock.__setReturn({
      componentInstance: {
        postEdited: new EventEmitter<void>(),
        postDeleted: new EventEmitter<number>(),
        commentCreated: new EventEmitter<number>(),
        likeClicked: new EventEmitter<void>(),
      },
      closed: new EventEmitter<any>() 
    });

    await TestBed.configureTestingModule({
      imports: [DetailComponent,HttpClientTestingModule],
      providers: [
        { provide: Dialog, useValue: dialogMock },
        { provide: DialogRef, useValue: dialogRef },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LikeService, useValue: likeServiceMock },
        { provide: PostService, useValue: postServiceMock },
        { provide: CommentService, useValue: commentServiceMock },
        { provide: DIALOG_DATA, useValue: { post: mockPost }},
        { provide: NotificationService, useValue: notificationServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    spyOn(console, 'log');
    spyOn(console, 'error');
    spyOn(component, 'getPostLikes').and.callThrough();
    spyOn(component.postLiked, 'emit');
    spyOn(component.postDeleted, 'emit');
    spyOn(component.commentCreated, 'emit');
    spyOn(component, 'getComments').and.callThrough();
    spyOn(component.likeClicked, 'emit');

    component.post = mockPost;
    component.commentsPag = mockPagination;

    fixture.detectChanges();

    (likeServiceMock.getLikes as jasmine.Spy).calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the component', () => {

    expect(mockLikes.length).toBe(14); 
    expect(component.isAuth).toBe(true);
    expect(component.user).toEqual(mockShortUser);

    expect(component.post).toEqual(mockPost);
    expect(component.commentForm).toBeDefined();
    expect(component.commentForm.value).toEqual({ content: '' });

   component.likesLoaded = false; 
    component.getPostLikes(); 
    expect(component.likes).toEqual(mockLikes);
    expect(likeServiceMock.getLikes).toHaveBeenCalledWith(mockPost.id,1);
    
  
    component.getComments(); 
    expect(component.comments).toEqual(mockComments);
    expect(commentServiceMock.getComments).toHaveBeenCalled();
  });

  it('should call deletePost and emit postDeleted', () => {
    component.deletePost();
    expect(component.isDeleteViewOpen).toBeFalse();
    expect(dialogRef.close).toHaveBeenCalled();
    expect(postServiceMock.deletePost).toHaveBeenCalledWith(mockPost.id);
    expect(component.postDeleted.emit).toHaveBeenCalledWith(mockPost.id);
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Post deleted succesfully', 'success');
  });

  it('should handle deletePost error', () => {
    postServiceMock.deletePost.and.returnValue(
      throwError(()=>{return { error: 'Delete Fail' };})
    )
    component.deletePost();
    expect(component.isDeleteViewOpen).toBeFalse();
    expect(component.postDeleted.emit).not.toHaveBeenCalled();
    expect(postServiceMock.deletePost).toHaveBeenCalledWith(mockPost.id);
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Error deleting post', 'error');

  });

  it('should handle getComments Error', () => {
    commentServiceMock.getComments.and.returnValue(
      throwError(()=>{
        return{ error: 'getComments Fail'};
      })
    )
    component.getComments();

    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Error fetching post comments', 'error');

  });

  it('should create a comment calling commentService and emit commentCreated',()=>{
    component.commentForm.setValue({content: 'Create comment 1'});
    expect(component.commentForm.valid).toBeTrue ();
    component.postComment();

    expect(component.commentForm.valid).toBeFalse();
    expect(component.commentCreated.emit).toHaveBeenCalled();
    expect(commentServiceMock.postComment).toHaveBeenCalledOnceWith(
      component.post.id, mockNewComment
    );
  });

  it('should not create comment if content is empty',()=>{
    component.postComment();
    expect(component.commentForm.valid).toBeFalse();
    expect(commentServiceMock.postComment).not.toHaveBeenCalled();
  });

  it('should handle create a comment error', () => {
    component.commentForm.setValue({content: 'Create comment 1'});
    commentServiceMock.postComment.and.returnValue(
      throwError(()=>{
        return{ error: 'postComment Fail'};
      })
    );
    (component.getComments as jasmine.Spy).calls.reset(); 
    component.postComment();

    expect(component.commentCreated.emit).not.toHaveBeenCalled();
    expect(component.getComments).not.toHaveBeenCalled();
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Error creating new comment', 'error');
  });

  it('should call getPostLikes based on likesLoaded status', () => {
    component.likesLoaded = false; 

    component.getPostLikes(); 
    expect(component.likesLoaded).toBeTrue(); 
    expect(likeServiceMock.getLikes).toHaveBeenCalledWith(mockPost.id,1);
    expect(likeServiceMock.getLikes).toHaveBeenCalledTimes(1);

    component.getPostLikes(); 
    expect(likeServiceMock.getLikes).toHaveBeenCalledTimes(1);
  });

  it('should call giveLike and emit likeClicked', () => {
    component.isAuth = true; 
    
    component.giveLike();
    
    expect(component.likeClicked.emit).toHaveBeenCalledWith(); 
    
    component.giveLike(); 
    expect(component.likeClicked.emit).toHaveBeenCalledTimes(2); 
  });

  it('should call getComments with lastPage after posting comment if comments >= 5', () => {
    component.comments = Array(5).fill({ content: 'test', author: mockShortUser, created_at: '' });
    component.commentsPag = { ...mockPagination, total_pages: 2 };
  
    component.commentForm.setValue({ content: 'New comment' });  
    component.postComment();
  
    expect(component.commentCreated.emit).toHaveBeenCalledWith(mockPost.id);
    expect(component.getComments).toHaveBeenCalledWith(3);
  });

});