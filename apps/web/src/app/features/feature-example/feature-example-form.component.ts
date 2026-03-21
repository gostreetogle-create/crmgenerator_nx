// Eve-arch: FORMS-014 — dumb-form на signals + input/output контракт
import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { ButtonComponent } from '@ui-kit/button';
import { InputComponent } from '@ui-kit/input';

export interface FeatureExampleDraft {
  title: string;
  owner: string;
  status: 'new' | 'in_progress' | 'done';
  notes?: string;
}

@Component({
  selector: 'app-feature-example-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, InputComponent],
  templateUrl: './feature-example-form.component.html',
  styleUrl: './feature-example-form.component.scss',
})
export class FeatureExampleFormComponent {
  readonly initialData = input<FeatureExampleDraft | null>(null);

  readonly saved = output<FeatureExampleDraft>();
  readonly cancelled = output<void>();

  readonly formData = signal<FeatureExampleDraft>({
    title: '',
    owner: '',
    status: 'new',
    notes: '',
  });

  private lastSeed: FeatureExampleDraft | null | undefined = undefined;

  readonly errors = computed(() => {
    const v = this.formData();
    return {
      title: v.title.trim() ? '' : 'Обязательно',
      owner: v.owner.trim() ? '' : 'Обязательно',
    };
  });

  readonly hasErrors = computed(() => Object.values(this.errors()).some(Boolean));

  constructor() {
    effect(() => {
      const v = this.initialData();
      if (v === this.lastSeed) return;
      this.lastSeed = v;
      this.formData.set(
        v
          ? { ...v }
          : {
              title: '',
              owner: '',
              status: 'new',
              notes: '',
            }
      );
    });
  }

  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as FeatureExampleDraft['status'];
    this.formData.update((curr) => ({ ...curr, status: value }));
  }

  onNotesInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.formData.update((curr) => ({ ...curr, notes: value }));
  }

  onSave() {
    if (this.hasErrors()) return;
    const v = this.formData();
    this.saved.emit({
      title: v.title.trim(),
      owner: v.owner.trim(),
      status: v.status,
      notes: v.notes?.trim() || undefined,
    });
  }
}
