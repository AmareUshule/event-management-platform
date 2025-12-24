import { Route } from '@angular/router';
import { HomeComponent } from './home.component';
import { LoginComponent } from './login.component';

export const appRoutes: Route[] = [
	{ path: '', component: HomeComponent },
	{ path: 'login', component: LoginComponent },
	{ path: '**', redirectTo: '' },
];
