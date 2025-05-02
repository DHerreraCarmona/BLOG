import { Routes } from '@angular/router';
import { LoginComponent } from './domains/users/pages/login/login.component';
import { RegisterComponent } from './domains/users/pages/register/register.component';
import { PostComponent } from '@post/components/post/post.component';
import { PostListComponent } from '@post/pages/post_list/post_list.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'posts',
        pathMatch: 'full'
    },
    {
        path: 'posts',
        component: PostListComponent
      },
    {
        path:'login',
        component: LoginComponent
    },
    {
        path:'register',
        component: RegisterComponent
    }

];
