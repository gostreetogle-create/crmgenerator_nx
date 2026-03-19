import { Route } from '@angular/router';
import { ClientsPageComponent } from './features/clients/clients-page.component';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'clients' },
  { path: 'clients', component: ClientsPageComponent },
];
