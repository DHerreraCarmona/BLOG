import { Routes } from '@angular/router';
import { LoginComponent } from './domains/users/pages/login/login.component';
import { RegisterComponent } from './domains/users/pages/register/register.component';
import { LayoutComponent } from '@shared/components/layout/layout.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'posts',
        pathMatch: 'full'
    },
    {
        path: 'posts',
        component: LayoutComponent
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
