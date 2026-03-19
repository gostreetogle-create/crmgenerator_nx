import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-card',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class CardComponent {
  title = input<string>('');
  subtitle = input<string>('');
  footer = input<boolean>(false);
  hoverable = input<boolean>(true);
}
