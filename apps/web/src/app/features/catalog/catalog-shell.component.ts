// Eve-arch: ROUTES-004 — вложенный outlet `/catalog/*` (дочерние маршруты lazy)
// Eve-BL: BL-CAT-SHELL-001 — родительский маршрут `/catalog/*` для справочников и товаров
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Родительский маршрут для `/catalog/*` (дочерние страницы справочников). */
@Component({
  selector: 'app-catalog-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class CatalogShellComponent {}
