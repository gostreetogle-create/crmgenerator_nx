// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-FORM-ENTITY-001 — форма категории (компактный справочник)
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
import { Category } from '@domain';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, InputComponent],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CategoryFormComponent implements OnInit {
  readonly category = input<Category | null>(null);
  /** Все категории для выбора родителя (исключая текущую при редактировании). */
  readonly allCategories = input<Category[]>([]);

  readonly save = output<Omit<Category, '_id'>>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();

  readonly formData = signal<Partial<Category>>({});

  readonly parentOptions = computed(() => {
    const selfId = this.category()?._id;
    return this.allCategories().filter((c) => c._id && c._id !== selfId);
  });

  readonly errors = computed(() => {
    const d = this.formData();
    const name = d.name?.trim() ? '' : 'Обязательно';
    const sortOrder =
      d.sortOrder !== undefined &&
      d.sortOrder !== null &&
      (Number.isNaN(Number(d.sortOrder)) || Number(d.sortOrder) < 0)
        ? 'Неотрицательное число'
        : '';
    return { name, sortOrder };
  });

  readonly hasErrors = computed(() =>
    Object.values(this.errors()).some((v) => Boolean(v))
  );

  constructor() {
    effect(() => {
      const v = this.category();
      this.formData.set(v ? { ...v } : { isActive: true, sortOrder: 0 });
    });
  }

  ngOnInit(): void {
    console.log('Форма init, данные =', this.formData());
    console.log('Форма открыта, данные загружены?');
  }

  /** Изоляция submit от родительской формы (например «Товар» в модалке поверх). */
  onNgSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.onSubmit();
  }

  onSubmit() {
    if (this.hasErrors()) return;
    const d = this.formData();
    const parentId = d.parentId?.trim() || undefined;
    const sortRaw = d.sortOrder;
    const sortNum = Number(sortRaw);
    const sortOrder =
      sortRaw === undefined || sortRaw === null || Number.isNaN(sortNum)
        ? undefined
        : sortNum;
    const name = d.name?.trim();
    if (!name) return;
    this.save.emit({
      name,
      parentId: parentId || undefined,
      sortOrder,
      isActive: d.isActive !== false,
    });
  }

  asText(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  onParentChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.formData.update((v) => ({
      ...v,
      parentId: value || undefined,
    }));
  }

  onSortOrderChange(raw: string) {
    const n = raw === '' ? 0 : Number(raw);
    this.formData.update((v) => ({
      ...v,
      sortOrder: Number.isNaN(n) ? v.sortOrder : n,
    }));
  }

  onActiveChange(checked: boolean) {
    this.formData.update((v) => ({ ...v, isActive: checked }));
  }
}
