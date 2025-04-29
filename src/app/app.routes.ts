import { Routes } from '@angular/router';
import { LoginComponent } from './domains/users/pages/login/login.component';
import { RegisterComponent } from './domains/users/pages/register/register.component';

export const routes: Routes = [
    {
        path:'login',
        component: LoginComponent
    },
    {
        path:'register',
        component: RegisterComponent
    }

];
