// Eve-arch: 000 — без выделенного паттерна
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
