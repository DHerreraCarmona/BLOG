import { CommonModule } from '@angular/common';
import { Component, Inject,ChangeDetectorRef } from '@angular/core';
import { DialogRef,DIALOG_DATA } from '@angular/cdk/dialog';

import { Post, PostEditCreate } from '@shared/models/post';
import { PostService } from '@shared/services/post.service';
import { tap } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './createEdit.component.html',
})
export class EditComponent {
  postId!: number;
  post!: PostEditCreate;
  isCreate: boolean = false;

  accessLevels = [
    {value: 0, access:"Hidden"},
    {value: 1, access:"Read Only"},
    {value: 2, access:"Read & Write"},
  ]
 
  postAccess: number[] = [1,1,2,2]
  accessLabels = ['Public', 'Authenticated', 'Team', 'Owner'];

  constructor(
    private postService: PostService,
    private dialogRef: DialogRef<PostEditCreate>,
    @Inject(DIALOG_DATA) private data: { postId?: number; isCreate?: boolean },
  ){
    this.isCreate = data?.isCreate === true;
    if (!this.isCreate && data?.postId) {
      this.postId = data.postId;
      this.postService.getEditPost(this.postId).subscribe(post => {
        this.post = post;
        this.postAccess = [post.public, post.authenticated, post.team, post.owner];
      });
    }
    else {
      this.post = {id: 0,title: '',author:{username:""},
      content: '',public: 0,authenticated: 1,team: 1,owner: 2
      };
    }
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
  
  onSubmit(){
    if (!this.post.title || !this.post.content) {
      alert("Title and content cannot be empty.");
      return;
    }
    
    [this.post.public,this.post.authenticated,this.post.team,this.post.owner]= this.postAccess;
    
    if(this.isCreate){
      this.postService.createPost(this.post).subscribe({
        next: (response) => {
          console.log("Post created successfully:", response);
          this.dialogRef.close(response);
          location.reload();
        },
        error: (error) => {
          console.error("Error creating post:", error);
          alert("An error occurred while updating the post. Please try again.");
        }
      });
      return;
    }
    
    this.postService.postEditPost(this.post).subscribe({
      next: (response) => {
        console.log("Post updated successfully:", response);
        this.dialogRef.close(response);

        location.reload();
      },
      error: (error) => {
        console.error("Error updating post:", error);
        alert("An error occurred while updating the post. Please try again.");
      }
    });
  }

  close(){
    this.dialogRef.close(); 
  }  
}
