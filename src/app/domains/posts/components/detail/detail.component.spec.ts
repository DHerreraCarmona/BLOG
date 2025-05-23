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
import { mockPost,mockLikes,createMockLikes,mockComments,mockNewComment,mockPagination,mockShortUser,
  createAuthServiceMock,createLikeServiceMock,createCommentServiceMock,createpostServiceMock,
  createDialogMock,createMockDialogRef
} from '@shared/mocks/mocks'

let likesMock: any;
let dialogRef: any;
let dialogMock: any;
let authServiceMock: any;
let postServiceMock: any;
let likeServiceMock: any;
let commentServiceMock: any;

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  beforeEach(async () => {
    likesMock = createMockLikes(); 
    dialogRef = createMockDialogRef();
    dialogMock = createDialogMock(dialogRef);
    authServiceMock = createAuthServiceMock();
    postServiceMock = createpostServiceMock();
    commentServiceMock = createCommentServiceMock();
    likeServiceMock = createLikeServiceMock(likesMock);

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
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    spyOn(console, 'log');
    spyOn(console, 'error');
    spyOn(component, 'getPostLikes');
    spyOn(component.postLiked, 'emit');
    spyOn(component.postDeleted, 'emit');
    spyOn(component.commentCreated, 'emit');
    spyOn(component, 'getComments').and.callThrough();

    component.post = mockPost;
    component.commentsPag = mockPagination;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the component', () => {

    expect(mockLikes.length).toBe(14); 
    expect(component.isAuth).toBe(true);
    expect(component.user).toEqual(mockShortUser);
    expect(component.isOwnerOrTeamEdit).toBe(false);

    expect(component.post).toEqual(mockPost);
    expect(component.form).toBeDefined();
    expect(component.form.value).toEqual({ content: '' });

    expect(component.likes).toEqual(mockLikes);
    expect(likeServiceMock.getLikes).toHaveBeenCalled();
    
    expect(component.comments).toEqual(mockComments);
    expect(commentServiceMock.getComments).toHaveBeenCalled();
  });

  it('should call deletePost and emit postDeleted', () => {
    component.deletePost();
    expect(component.isDeleteViewOpen).toBeFalse();
    expect(dialogRef.close).toHaveBeenCalled();
    expect(postServiceMock.deletePost).toHaveBeenCalledWith(mockPost.id);
    expect(component.postDeleted.emit).toHaveBeenCalledWith(mockPost.id);
    expect(console.log).toHaveBeenCalledOnceWith('Post deleted successfully', { success: true });
  });

  it('should handle deletePost error', () => {
    postServiceMock.deletePost.and.returnValue(
      throwError(()=>{return { error: 'Delete Fail' };})
    )
    component.deletePost();
    expect(component.isDeleteViewOpen).toBeFalse();
    expect(component.postDeleted.emit).not.toHaveBeenCalled();
    expect(postServiceMock.deletePost).toHaveBeenCalledWith(mockPost.id);
    expect(console.error).toHaveBeenCalledWith('Error deleting post', { error: 'Delete Fail'});
  });

  it('should handle getComments Error', () => {
    commentServiceMock.getComments.and.returnValue(
      throwError(()=>{
        return{ error: 'getComments Fail'};
      })
    )
    component.getComments();
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching comments:',{ error: 'getComments Fail'}
    );
  });

  it('should create a comment calling commentService and emit commentCreated',()=>{
    component.form.setValue({content: 'Create comment 1'});
    expect(component.form.valid).toBeTrue ();
    component.postComment();

    expect(component.form.valid).toBeFalse();
    expect(component.commentCreated.emit).toHaveBeenCalled();
    expect(commentServiceMock.postComment).toHaveBeenCalledOnceWith(
      component.post.id, mockNewComment
    );
  });

  it('should not create comment if content is empty',()=>{
    component.postComment();
    expect(component.form.valid).toBeFalse();
    expect(commentServiceMock.postComment).not.toHaveBeenCalled();
  });

  it('should hancdle create a comment error',()=>{
    component.form.setValue({content: 'Create comment 1'});
    commentServiceMock.postComment.and.returnValue(
      throwError(()=>{
        return{ error: 'postComment Fail'};
      })
    );
    component.postComment();

    expect(component.commentCreated.emit).not.toHaveBeenCalled();
    expect(component.getComments).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith( 
      'Error creating comment:',{ error: 'postComment Fail'}
    );
  });

  it('should call getPostLikes based on likesLoaded status', () => {
    component.getPostLikes();        //likesLoaded is False, call service
    expect(component.likesLoaded).toBeTrue;

    expect(component.likes).toEqual(mockLikes);
    expect(likeServiceMock.getLikes).toHaveBeenCalledWith(mockPost.id);

    component.getPostLikes();         //likesLoaded is True, dont call service again
    expect(likeServiceMock.getLikes).toHaveBeenCalledTimes(1);
  });

  it('should call giveLike and emit postLiked for like and dislike', () => {
    
    component.post.isLiked = false;
    component.post.countLikes = component.likes.length;   
    expect(mockLikes.length).toBe(14);
    component.giveLike();
    expect(mockLikes.length).toBe(14);

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

  it('should call getComments with lastPage after posting comment if comments >= 5', () => {
    component.comments = Array(5).fill({ content: 'test', author: mockShortUser, created_at: '' });
    component.commentsPag = { ...mockPagination, total_pages: 2 };
  
    component.form.setValue({ content: 'New comment' });  
    component.postComment();
  
    expect(component.commentCreated.emit).toHaveBeenCalledWith(mockPost.id);
    expect(component.getComments).toHaveBeenCalledWith(3);
  });

});
