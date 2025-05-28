import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Dialog} from '@angular/cdk/dialog';

import { HeaderComponent } from '../header/header.component';
import { PostListComponent } from '@post/pages/post_list/post_list.component';

import { CreateEditComponent } from '@post/components/createEdit/createEdit.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '@shared/services/auth.service';
import { Observable } from 'rxjs';
import { PostEditCreate } from '@shared/models/post';

@Component({
  selector: 'app-layout',
  imports: [RouterModule, HeaderComponent,PostListComponent,CommonModule],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  @ViewChild(PostListComponent) postListComponent!: PostListComponent;


  isAuth$: Observable<boolean>;

  constructor(
    private authServive: AuthService,
    private dialog: Dialog
  ){
    this.isAuth$ = this.authServive.authStatus$;
  }

  openCreateModal(){
    const dialogDetailRef = this.dialog.open(CreateEditComponent,
      { minWidth: '75%',
        maxWidth: '100%',
        data:{
          isCreate: true
        }
      } 
    );
    if(dialogDetailRef.componentInstance ){
      dialogDetailRef.componentInstance.postCreated.subscribe(_=>{
        this.postListComponent.onPostCreate();
        
      })
    }
  }
}
