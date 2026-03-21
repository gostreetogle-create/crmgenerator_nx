import { Route } from '@angular/router';

// Eve-arch: ROUTES-004 — единая карта standalone маршрутов
// Eve-PERF: PERF-LAZY-ROUTES-001 — loadComponent: меньше initial bundle, чанки по фичам
export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'clients' },
  {
    path: 'clients',
    loadComponent: () =>
      import('./features/clients/clients-page.component').then((m) => m.ClientsPageComponent),
  },
  {
    path: 'organizations',
    loadComponent: () =>
      import('./features/organizations/organizations-page.component').then(
        (m) => m.OrganizationsPageComponent
      ),
  },
  {
    path: 'ui',
    loadComponent: () =>
      import('./features/ui-catalog/ui-catalog.component').then((m) => m.UiCatalogComponent),
  },
  {
    path: 'demo-feature',
    loadComponent: () =>
      import('./features/feature-example/feature-example-page.component').then(
        (m) => m.FeatureExamplePageComponent
      ),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./features/catalog/catalog-shell.component').then((m) => m.CatalogShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'categories' },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/categories-page.component').then(
            (m) => m.CategoriesPageComponent
          ),
      },
      {
        path: 'materials',
        loadComponent: () =>
          import('./features/materials/materials-page.component').then(
            (m) => m.MaterialsPageComponent
          ),
      },
      {
        path: 'part-types',
        loadComponent: () =>
          import('./features/part-types/part-types-page.component').then(
            (m) => m.PartTypesPageComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products-page.component').then((m) => m.ProductsPageComponent),
      },
    ],
  },
];
