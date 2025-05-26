import { Router } from '@angular/router';
import { Dialog} from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, Inject,ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { DialogRef,DIALOG_DATA } from '@angular/cdk/dialog';
import { QuillModule } from 'ngx-quill';

import { Post, PostDetail, PostEditCreate } from '@shared/models/post';
import { PostService } from '@shared/services/post.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '@shared/notifications/notifications.service';

@Component({
  selector: 'app-create-edit',
  standalone:true,
  imports: [CommonModule, FormsModule,QuillModule],
  templateUrl: './createEdit.component.html',
})
export class CreateEditComponent {
  @Output() postCreated = new EventEmitter();
  @Output() postEdited = new EventEmitter<number>();

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, false] }],
      ['link','code-block', 'blockquote', 'image', 'video'],
    ]
  };

  postId!: number;
  post!: PostEditCreate;
  isCreate: boolean = false;
  originalPost?: PostEditCreate;

  accessLevels = [
    {value: 0, access:"Hidden"},
    {value: 1, access:"Read Only"},
    {value: 2, access:"Read & Write"},
  ]
 
  postAccess: number[] = [1,1,2,2]
  accessLabels = ['Public', 'Authenticated', 'Team', 'Owner'];

  constructor(
    private dialog: Dialog,
    private router: Router,
    private postService: PostService,
    private dialogRef: DialogRef<PostEditCreate>,
    private notificationService: NotificationService,
    @Inject(DIALOG_DATA) private data: { postId?: number; isCreate?: boolean },
  ){
    this.isCreate = data?.isCreate === true;

    if (!this.isCreate && data?.postId) {
      this.postId = data.postId;
      this.postService.getEditPost(this.postId).subscribe(post => {
        this.post = post;
        this.originalPost = { ...post };
        this.postAccess = [post.public, post.authenticated, post.team, post.owner];
      });
    } else {
      this.post = {
        id: 0, title: '', author: { username: '' },
        content: '', public: 0, authenticated: 1, team: 1, owner: 2
      };
    }
  }

  onSubmit() {
    this.post.title = this.post.title.trim();
    this.post.content = this.post.content.trim();
    
    if (!this.post.title || !this.post.content) {
      this.notificationService.show(`Title and content cannot be empty.`, 'error');
      return;
    }

    [this.post.public,this.post.authenticated,this.post.team,this.post.owner]= this.postAccess;

    const action: 'creat' | 'edit' = this.isCreate ? 'creat' : 'edit';
    const callback = (response: PostEditCreate) => {
      this.notificationService.show(`${action}ing post successfully`, 'success');
    };
    const errorCallback = (error: any) => {
      this.notificationService.show(`Error ${action}ing post`, 'error');
    };

    if (this.isCreate) {
      this.postCreated.emit();
      this.postService.createPost(this.post).subscribe({ next: callback, error: errorCallback });

    } else {
      if (
        this.originalPost &&
        this.post.title.trim() === this.originalPost.title.trim() &&
        this.post.content.trim() === this.originalPost.content.trim()
      ) {
        this.notificationService.show('No changes made to the post.', 'success');
        this.close();
        return;
      }

      this.postEdited.emit(this.post.id);
      this.postService.postEditPost(this.post).subscribe({ next: callback, error: errorCallback });
    }

    this.close();
  }

  getOptionsForLevel(index: number) {
    if (index <= 1) return this.accessLevels.filter(opt => opt.value <= 1); // Public
    if (index === 3) return this.accessLevels.filter(opt => opt.value >= 2); // Owner
    return this.accessLevels;
  }

  onAccessChange(newValue: number, index: number): void {
    this.postAccess[index] = newValue;
  
    if (index < this.postAccess.length - 1 && newValue > this.postAccess[index + 1]) {
      this.propagateDown(index);
    } else if (index > 0 && newValue < this.postAccess[index - 1]) {
      this.propagateUp(index);
    }
  }
  
  private propagateDown(fromIndex: number): void {
    for (let i = fromIndex + 1; i < this.postAccess.length; i++) {
      if (this.postAccess[i] < this.postAccess[i - 1]) {
        this.postAccess[i] = this.postAccess[i - 1];
      } else {
        break;
      }
    }
  }
  
  private propagateUp(fromIndex: number): void {
    for (let i = fromIndex - 1; i >= 0; i--) {
      if (this.postAccess[i] > this.postAccess[i + 1]) {
        this.postAccess[i] = this.postAccess[i + 1];
      } else {
        break;
      }
    }
  }

  close(){
    this.dialogRef.close(this.post); 
  }  
}
