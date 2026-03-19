import { CommonModule } from '@angular/common';
import {
  Component,
  OnChanges,
  ViewEncapsulation,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '@ui-kit/button';
import { CardComponent } from '@ui-kit/card';
import { InputComponent } from '@ui-kit/input';
import { Client } from './client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, InputComponent],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ClientFormComponent implements OnChanges {
  readonly client = input<Client | null>(null);

  readonly save = output<Partial<Client>>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();

  readonly formData = signal<Partial<Client>>({});

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
    const discount =
      d.discount !== undefined &&
      d.discount !== null &&
      (Number.isNaN(d.discount) || d.discount < 0 || d.discount > 100)
        ? 'Значение 0-100'
        : '';
    return { name, phone, email, inn, kpp, discount };
  });

  readonly hasErrors = computed(() =>
    Object.values(this.errors()).some((v) => Boolean(v))
  );

  ngOnChanges() {
    const value = this.client();
    this.formData.set(value ? { ...value } : {});
  }

  onSubmit() {
    if (this.hasErrors()) return;
    const data = this.formData();
    this.save.emit({
      ...data,
      name: data.name?.trim(),
      phone: data.phone?.trim(),
      email: data.email?.trim(),
      inn: data.inn?.trim(),
      kpp: data.kpp?.trim(),
      contactPerson: data.contactPerson?.trim(),
      address: data.address?.trim(),
      requisites: data.requisites?.trim(),
      notes: data.notes?.trim(),
    });
  }

  asText(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }
}
