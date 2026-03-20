import { Route } from '@angular/router';
import { CategoriesPageComponent } from './features/categories/categories-page.component';
import { CatalogShellComponent } from './features/catalog/catalog-shell.component';
import { ClientsPageComponent } from './features/clients/clients-page.component';
import { MaterialsPageComponent } from './features/materials/materials-page.component';
import { OrganizationsPageComponent } from './features/organizations/organizations-page.component';
import { PartTypesPageComponent } from './features/part-types/part-types-page.component';
import { ProductsPageComponent } from './features/products/products-page.component';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'clients' },
  { path: 'clients', component: ClientsPageComponent },
  { path: 'organizations', component: OrganizationsPageComponent },
  {
    path: 'catalog',
    component: CatalogShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'categories' },
      { path: 'categories', component: CategoriesPageComponent },
      { path: 'materials', component: MaterialsPageComponent },
      { path: 'part-types', component: PartTypesPageComponent },
      { path: 'products', component: ProductsPageComponent },
    ],
  },
];
