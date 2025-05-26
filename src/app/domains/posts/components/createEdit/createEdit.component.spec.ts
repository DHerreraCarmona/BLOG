import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CreateEditComponent } from './createEdit.component';
import { PostService } from '@shared/services/post.service';
import { NotificationService } from '@shared/notifications/notifications.service';
import { mockEditPost, createpostServiceMock, createMockDialogRef } from '@shared/mocks/mocks';

describe('CreateEditComponent - Edit Mode', () => {
  let component: CreateEditComponent;
  let fixture: ComponentFixture<CreateEditComponent>;
  let postServiceMock: jasmine.SpyObj<PostService>;
  let dialogRefMock: jasmine.SpyObj<DialogRef>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    postServiceMock = createpostServiceMock() as jasmine.SpyObj<PostService>;
    dialogRefMock = createMockDialogRef() as jasmine.SpyObj<DialogRef>;
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['show']);

    await TestBed.configureTestingModule({
      imports: [CreateEditComponent, HttpClientTestingModule],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: DialogRef, useValue: dialogRefMock },
        { provide: DIALOG_DATA, useValue: { postId: 1, isCreate: false } },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditComponent);
    component = fixture.componentInstance;
    spyOn(console, 'log');
    spyOn(console, 'error');
    
    spyOn(component.postCreated, 'emit');
    spyOn(component.postEdited, 'emit');

    postServiceMock.getEditPost.and.returnValue(of(mockEditPost));
    
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize for edit mode and call getEditPost', () => {
    expect(component.isCreate).toBeFalse();
    expect(component.postId).toBe(1);
    expect(postServiceMock.getEditPost).toHaveBeenCalledWith(1);
    expect(component.post).toEqual(mockEditPost);
    expect(component.originalPost).toEqual(mockEditPost);
    expect(component.postAccess).toEqual([
      mockEditPost.public,
      mockEditPost.authenticated,
      mockEditPost.team,
      mockEditPost.owner
    ]);
  });

  it('should update post onSubmit in edit mode', () => {
    const updatedPost = { ...mockEditPost, title: 'Updated Title', content: 'Updated content' };
    component.post = updatedPost;
    component.originalPost = mockEditPost;
    component.postAccess = [1, 1, 2, 2];

    postServiceMock.postEditPost.and.returnValue(of(updatedPost));

    component.onSubmit();

    expect(postServiceMock.postEditPost).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'Updated Title' })
    );
    expect(component.postEdited.emit).toHaveBeenCalledWith(updatedPost.id);
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('editing post successfully', 'success');
    expect(dialogRefMock.close).toHaveBeenCalledWith(updatedPost);
  });

  it('should show notification if title or content is empty on submit', () => {
    component.post = { ...mockEditPost, title: '', content: '' };
    
    component.onSubmit();

    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Title and content cannot be empty.', 'error');
    expect(postServiceMock.createPost).not.toHaveBeenCalled();
    expect(postServiceMock.postEditPost).not.toHaveBeenCalled();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('should handle onSubmit Edit Error', () => {
    component.isCreate = false;
    component.postAccess = [1, 1, 2, 2];
    component.post = { ...mockEditPost, title: 'Changed' };
    component.originalPost = mockEditPost;

    postServiceMock.postEditPost.and.returnValue(
      throwError(() => ({ error: 'Edit Fail' }))
    );

    component.onSubmit();
    expect(component.postEdited.emit).toHaveBeenCalled();
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Error editing post', 'error');
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should show notification and close dialog if no changes made in edit mode', () => {
    component.isCreate = false;
    component.post = { ...mockEditPost };
    component.originalPost = { ...mockEditPost };
    
    component.onSubmit();

    expect(notificationServiceSpy.show).toHaveBeenCalledWith('No changes made to the post.', 'success');
    expect(postServiceMock.postEditPost).not.toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalledWith(component.post);
  });

  it('should manage levels options correctly', () => {
    let options = component.getOptionsForLevel(0);
    expect(options.every(opt => opt.value <= 1)).toBeTrue();

    options = component.getOptionsForLevel(2);
    expect(options.length).toBe(component.accessLevels.length);

    options = component.getOptionsForLevel(3);
    expect(options.every(opt => opt.value >= 2)).toBeTrue();
  });

  it('should propagate down when newValue is greater than next level', () => {
    component.postAccess = [1, 1, 1, 1];
    component.onAccessChange(2, 1); 
  
    expect(component.postAccess).toEqual([1, 2, 2, 2]); 
  });

  it('should propagate up when newValue is less than previous level', () => {
    component.postAccess = [1, 1, 2, 2]; 
    component.onAccessChange(0, 2); 
  
    expect(component.postAccess).toEqual([0, 0, 0, 2]); 
  });
});

describe('CreateEditComponent - Create Mode', () => {
  let component: CreateEditComponent;
  let fixture: ComponentFixture<CreateEditComponent>;
  let postServiceMock: jasmine.SpyObj<PostService>;
  let dialogRefMock: jasmine.SpyObj<DialogRef>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    postServiceMock = createpostServiceMock() as jasmine.SpyObj<PostService>;
    dialogRefMock = createMockDialogRef() as jasmine.SpyObj<DialogRef>;
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['show']);

    await TestBed.configureTestingModule({
      imports: [CreateEditComponent, HttpClientTestingModule],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: DialogRef, useValue: dialogRefMock },
        { provide: DIALOG_DATA, useValue: { isCreate: true } },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditComponent);
    component = fixture.componentInstance;
    spyOn(console, 'log');
    spyOn(console, 'error');
    spyOn(component.postCreated, 'emit');
    spyOn(component.postEdited, 'emit');

    fixture.detectChanges();
  });

  it('should initialize for create mode', () => {
    expect(component.isCreate).toBeTrue();
    expect(component.post).toEqual({
      id: 0, title: '', author: { username: '' },
      content: '', public: 0, authenticated: 1, team: 1, owner: 2
    });
    expect(postServiceMock.getEditPost).not.toHaveBeenCalled();
  });

  it('should create new post', () => {
    const newPost = { ...mockEditPost, id: 0 };
    component.post = newPost;
    component.postAccess = [1, 1, 2, 2];

    postServiceMock.createPost.and.returnValue(of({ ...newPost, id: 10 }));

    component.onSubmit();

    expect(postServiceMock.createPost).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: newPost.title })
    );
    expect(component.postCreated.emit).toHaveBeenCalled();
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('creating post successfully', 'success');
    expect(dialogRefMock.close).toHaveBeenCalledWith(newPost);
  });

  it('should handle onSubmit Create Error', () => {
    component.post = { ...mockEditPost, id: 0 };
    component.postAccess = [1, 1, 2, 2];

    postServiceMock.createPost.and.returnValue(
      throwError(() => ({ error: 'Create Fail' }))
    );

    component.onSubmit();
    expect(component.postCreated.emit).toHaveBeenCalled();
    expect(notificationServiceSpy.show).toHaveBeenCalledWith('Error creating post', 'error');
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});