// Eve-arch: 000 — без выделенного паттерна
// Eve-BL: BL-FORM-ENTITY-001 — форма организации: вкладки, реквизиты, плотный enterprise-layout
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
import { Organization } from '@domain';

type OrgImageField = 'logoUrl' | 'signatureUrl' | 'stampUrl';

/** Вкладки: без одной длинной колонки — как в типичных CRM-формах */
type OrgFormTab = 'requisites' | 'address' | 'people' | 'files';

@Component({
  selector: 'app-organization-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, InputComponent],
  templateUrl: './organization-form.component.html',
  styleUrl: './organization-form.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationFormComponent implements OnInit {
  readonly organization = input<Organization | null>(null);

  readonly save = output<Partial<Organization>>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();

  readonly formData = signal<Partial<Organization>>({});

  readonly activeTab = signal<OrgFormTab>('requisites');

  /** Локально: до подключения API картинки кодируются в data URL (лимит — чтобы не забивать localStorage). */
  readonly maxImageBytes = 512 * 1024;
  readonly uploadError = signal<string | null>(null);

  readonly errors = computed(() => {
    const d = this.formData();
    const name = d.name?.trim() ? '' : 'Обязательно';
    const phone =
      d.phone && d.phone.trim().length > 0 && d.phone.trim().length < 7
        ? 'Минимум 7 символов'
        : '';
    const email =
      d.email && d.email.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)
        ? 'Некорректный email'
        : '';
    const inn = d.inn && !/^\d+$/.test(d.inn) ? 'Только цифры' : '';
    const kpp = d.kpp && !/^\d+$/.test(d.kpp) ? 'Только цифры' : '';
    const ogrn = d.ogrn && !/^\d+$/.test(d.ogrn) ? 'Только цифры' : '';
    const okpo = d.okpo && !/^\d+$/.test(d.okpo) ? 'Только цифры' : '';
    const bik = d.bik && !/^\d+$/.test(d.bik) ? 'Только цифры' : '';
    const markup =
      d.markup !== undefined &&
      d.markup !== null &&
      (Number.isNaN(d.markup) || d.markup < 0 || d.markup > 100)
        ? 'Значение 0-100'
        : '';
    const vatPercent =
      d.vatPercent !== undefined &&
      d.vatPercent !== null &&
      (Number.isNaN(d.vatPercent) || d.vatPercent < 0 || d.vatPercent > 100)
        ? 'Значение 0-100'
        : '';
    return { name, phone, email, inn, kpp, ogrn, okpo, bik, markup, vatPercent };
  });

  readonly hasErrors = computed(() =>
    Object.values(this.errors()).some((v) => Boolean(v))
  );

  constructor() {
    effect(() => {
      const value = this.organization();
      this.uploadError.set(null);
      this.formData.set(value ? { ...value } : {});
      this.activeTab.set('requisites');
    });
  }

  ngOnInit(): void {
    console.log('Форма init, данные =', this.formData());
    console.log('Форма открыта, данные загружены?');
  }

  setTab(tab: OrgFormTab): void {
    this.activeTab.set(tab);
  }

  onSubmit() {
    if (this.hasErrors()) return;
    const data = this.formData();
    const trimmed: Partial<Organization> = {};
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === 'string') (trimmed as Record<string, unknown>)[k] = v.trim();
      else (trimmed as Record<string, unknown>)[k] = v;
    }
    this.save.emit(trimmed);
  }

  asText(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  onImageFile(event: Event, field: OrgImageField): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.uploadError.set(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.uploadError.set('Выберите файл изображения (JPG, PNG, WebP, GIF).');
      return;
    }
    if (file.size > this.maxImageBytes) {
      this.uploadError.set(
        `Файл больше ${Math.round(this.maxImageBytes / 1024)} КБ. Сожмите изображение или выберите другой файл.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        this.formData.update((v) => ({ ...v, [field]: result }));
      }
    };
    reader.onerror = () => {
      this.uploadError.set('Не удалось прочитать файл.');
    };
    reader.readAsDataURL(file);
  }

  clearImage(field: OrgImageField): void {
    this.uploadError.set(null);
    this.formData.update((v) => {
      const next = { ...v };
      delete next[field];
      return next;
    });
  }
}
