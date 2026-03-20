// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-FORM-ENTITY-001 — форма типа детали
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewEncapsulation,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '@ui-kit/button';
import { CardComponent } from '@ui-kit/card';
import { InputComponent } from '@ui-kit/input';
import { PartType } from '@domain';

@Component({
  selector: 'app-part-type-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, InputComponent],
  templateUrl: './part-type-form.component.html',
  styleUrl: './part-type-form.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PartTypeFormComponent implements OnInit {
  readonly partType = input<PartType | null>(null);

  readonly save = output<Omit<PartType, '_id'>>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();

  readonly formData = signal<Partial<PartType>>({});

  readonly errors = computed(() => {
    const d = this.formData();
    const name = d.name?.trim() ? '' : 'Обязательно';
    return { name };
  });

  readonly hasErrors = computed(() =>
    Object.values(this.errors()).some((v) => Boolean(v))
  );

  constructor() {
    effect(() => {
      const v = this.partType();
      this.formData.set(v ? { ...v } : { isActive: true });
    });
  }

  ngOnInit(): void {
    console.log('Форма init, данные =', this.formData());
    console.log('Форма открыта, данные загружены?');
  }

  onNgSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.onSubmit();
  }

  onSubmit() {
    if (this.hasErrors()) return;
    const d = this.formData();
    const name = d.name?.trim();
    if (!name) return;
    this.save.emit({
      name,
      description: d.description?.trim() || undefined,
      isActive: d.isActive !== false,
    });
  }

  asText(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  onDescriptionInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.formData.update((v) => ({ ...v, description: value }));
  }

  onActiveChange(checked: boolean) {
    this.formData.update((v) => ({ ...v, isActive: checked }));
  }
}
