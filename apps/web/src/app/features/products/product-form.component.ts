import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '@ui-kit/button';
import { CardComponent } from '@ui-kit/card';
import { InputComponent } from '@ui-kit/input';
import { Product } from '@domain';
import { CatalogLookupService } from '../../core/catalog';

type ProductFormTab = 'main' | 'classification' | 'functionality' | 'mounting';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, InputComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProductFormComponent implements OnInit {
  readonly product = input<Product | null>(null);
  readonly interactionLocked = input<boolean>(false);

  readonly save = output<Omit<Product, '_id'>>();
  readonly closeRequested = output<void>();
  readonly createCategoryRequested = output<void>();
  readonly createPartTypeRequested = output<void>();
  readonly createMaterialRequested = output<void>();

  protected readonly catalogLookup = inject(CatalogLookupService);

  readonly formData = signal<Partial<Product>>({});
  readonly activeTab = signal<ProductFormTab>('main');
  private lastSeedProduct: Product | null | undefined = undefined;

  readonly functionalityOptions = [
    'Ограждение',
    'Декор',
    'Несущая функция',
    'Защита',
    'Комбинированная',
  ] as const;

  readonly mountingOptions = [
    'Сварка',
    'Болтовое',
    'Анкерное',
    'Комбинированный',
    'По месту',
  ] as const;

  readonly errors = computed(() => {
    const d = this.formData();
    const name = d.name?.trim() ? '' : 'Обязательно';
    const categoryId = d.categoryId?.trim() ? '' : 'Обязательно';
    return { name, categoryId };
  });

  readonly hasErrors = computed(() =>
    Object.values(this.errors()).some((v) => Boolean(v))
  );

  constructor() {
    effect(() => {
      const v = this.product();
      if (v === this.lastSeedProduct) return;
      this.lastSeedProduct = v;
      this.formData.set(v ? { ...v } : { isActive: true });
      this.activeTab.set('main');
    });
  }

  ngOnInit(): void {
    this.catalogLookup.ensureLoaded();
  }

  setTab(tab: ProductFormTab): void {
    this.activeTab.set(tab);
  }

  onSubmit() {
    if (this.interactionLocked()) return;
    if (this.hasErrors()) return;
    const d = this.formData();
    const name = d.name?.trim();
    const categoryId = d.categoryId?.trim();
    if (!name || !categoryId) return;
    this.save.emit({
      name,
      sku: d.sku?.trim() || undefined,
      categoryId,
      partTypeId: d.partTypeId?.trim() || undefined,
      materialId: d.materialId?.trim() || undefined,
      functionality: d.functionality?.trim() || undefined,
      mounting: d.mounting?.trim() || undefined,
      notes: d.notes?.trim() || undefined,
      isActive: d.isActive !== false,
    });
  }

  asText(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  onNotesInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.formData.update((v) => ({ ...v, notes: value }));
  }

  onActiveChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.formData.update((v) => ({ ...v, isActive: checked }));
  }

  onCategoryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.formData.update((v) => ({
      ...v,
      categoryId: value || undefined,
    }));
  }

  onPartTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.formData.update((v) => ({
      ...v,
      partTypeId: value || undefined,
      materialId: value ? v.materialId : undefined,
    }));
  }

  onMaterialChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.formData.update((v) => ({
      ...v,
      materialId: value || undefined,
    }));
  }

  onFunctionalityChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.formData.update((v) => ({
      ...v,
      functionality: value || undefined,
    }));
  }

  onMountingChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.formData.update((v) => ({
      ...v,
      mounting: value || undefined,
    }));
  }

  onCancel() {
    if (this.interactionLocked()) return;
    this.closeRequested.emit();
  }
}
