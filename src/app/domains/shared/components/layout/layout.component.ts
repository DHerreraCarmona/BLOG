import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { PostListComponent } from '@post/pages/post_list/post_list.component';

@Component({
  selector: 'app-layout',
  imports: [RouterModule, HeaderComponent, PostListComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {

}
