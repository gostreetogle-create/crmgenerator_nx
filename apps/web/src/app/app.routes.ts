import { Route } from '@angular/router';
import { ClientsPageComponent } from './features/clients/clients-page.component';
import { OrganizationsPageComponent } from './features/organizations/organizations-page.component';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'clients' },
  { path: 'clients', component: ClientsPageComponent },
  { path: 'organizations', component: OrganizationsPageComponent },
];
