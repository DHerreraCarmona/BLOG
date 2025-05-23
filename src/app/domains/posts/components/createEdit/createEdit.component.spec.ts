import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { of, throwError } from 'rxjs';

import { CreateEditComponent } from './createEdit.component';
import { PostService } from '@shared/services/post.service';
import { mockEditPost, createpostServiceMock, createMockDialogRef } from '@shared/mocks/mocks';

describe('CreateEditComponent', () => {
  let component: CreateEditComponent;
  let fixture: ComponentFixture<CreateEditComponent>;
  let postServiceMock: any;
  let dialogRefMock: any;

  beforeEach(async () => {
    postServiceMock = createpostServiceMock();
    dialogRefMock = createMockDialogRef();

    await TestBed.configureTestingModule({
      imports: [CreateEditComponent],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: DialogRef, useValue: dialogRefMock },
        { provide: DIALOG_DATA, useValue: { postId: 1, isCreate: false } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditComponent);
    component = fixture.componentInstance;
    spyOn(console,'log');
    spyOn(console,'error');
    spyOn(component.postCreateOrEdit,'emit');
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize for edit mode and call getEditPost', () => {
    expect(component.isCreate).toBeFalse();
    expect(component.postId).toBe(1);
    expect(postServiceMock.getEditPost).toHaveBeenCalledWith(1);
  });

  it('should update post onSubmit in edit mode', () => {
    component.postAccess = [ 1,1,2,2];
    component.post = { ...mockEditPost };

    component.onSubmit();

    expect(dialogRefMock.close).toHaveBeenCalledWith(mockEditPost);
    expect(postServiceMock.postEditPost).toHaveBeenCalledWith(mockEditPost);
  });

  it('should create new post if in create mode', () => {
    component.isCreate = true;
    component.post = { ...mockEditPost };

    component.onSubmit();

    expect(dialogRefMock.close).toHaveBeenCalledWith(mockEditPost);
    expect(postServiceMock.createPost).toHaveBeenCalledWith(mockEditPost);
  });

  it('should show alert if title or content is missing', () => {
    component.post = { ...mockEditPost, title: '', content: '' };
    spyOn(window, 'alert');

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Title and content cannot be empty.');
  });

  it('should handle onSubmit Create Error',()=>{
    component.isCreate = true;
    component.postAccess = [ 1,1,2,2];
    component.post = { ...mockEditPost };

    postServiceMock.createPost.and.returnValue(
      throwError(()=>{
        return { error: 'Create Fail' };
      })
    );

    component.onSubmit();
    expect(component.postCreateOrEdit.emit).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Error creating post:", { error: 'Create Fail' });
  });

  it('should handle onSubmit Create Error',()=>{
    component.isCreate = false;
    component.postAccess = [ 1,1,2,2];
    component.post = { ...mockEditPost };
    postServiceMock.postEditPost.and.returnValue(
      throwError(()=>{
        return { error: 'Edit Fail' };
      })
    );

    component.onSubmit();
    expect(component.postCreateOrEdit.emit).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Error updating post:", { error: 'Edit Fail' });
  });

  it('should manage levels options correctly', () => {
    var options = component.getOptionsForLevel(0);
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
