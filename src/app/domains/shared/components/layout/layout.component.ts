import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Dialog} from '@angular/cdk/dialog';

import { HeaderComponent } from '../header/header.component';
import { PostListComponent } from '@post/pages/post_list/post_list.component';

import { CreateEditComponent } from '@post/components/createEdit/createEdit.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '@shared/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [RouterModule, HeaderComponent,PostListComponent,CommonModule],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {

  isAuth$: Observable<boolean>;

  constructor(
    private authServive: AuthService,
    private dialog: Dialog
  ){
    this.isAuth$ = this.authServive.authStatus$;
  }

  openCreateModal(){
    this.dialog.open(CreateEditComponent,
      { minWidth: '75%',
        maxWidth: '75%',
        data:{
          isCreate: true
        }
      } 
    );
  }
}
