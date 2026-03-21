// Eve-arch: QUERY-008 — демо-страница синхронизирует поиск с URL
// Eve-arch: ACTIONS-STATE-002 — баннеры состояния + действия в строках
import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@ui-kit/button';
import { CardComponent } from '@ui-kit/card';
import { DialogComponent } from '@ui-kit/dialog';
import { InputComponent } from '@ui-kit/input';
import { FeatureExampleDraft, FeatureExampleFormComponent } from './feature-example-form.component';

interface FeatureExampleItem extends FeatureExampleDraft {
  id: string;
  createdAt: string;
}

@Component({
  selector: 'app-feature-example-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    CardComponent,
    DialogComponent,
    InputComponent,
    FeatureExampleFormComponent,
  ],
  templateUrl: './feature-example-page.component.html',
  styleUrl: './feature-example-page.component.scss',
})
export class FeatureExamplePageComponent {
  readonly items = signal<FeatureExampleItem[]>([
    {
      id: 'ex-1',
      title: 'Карточка клиента',
      owner: 'Eve',
      status: 'in_progress',
      notes: 'Проверить плотность формы',
      createdAt: new Date().toISOString(),
    },
  ]);

  readonly query = signal('');
  readonly showFormModal = signal(false);
  readonly showDetailsModal = signal(false);
  readonly showDeleteConfirm = signal(false);

  readonly editingId = signal<string | null>(null);
  readonly selectedId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.items();
    return this.items().filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        x.owner.toLowerCase().includes(q) ||
        x.status.toLowerCase().includes(q)
    );
  });

  readonly editingItem = computed(() =>
    this.items().find((x) => x.id === this.editingId()) ?? null
  );

  readonly selectedItem = computed(() =>
    this.items().find((x) => x.id === this.selectedId()) ?? null
  );

  onCreate() {
    this.editingId.set(null);
    this.showFormModal.set(true);
  }

  onEdit(id: string) {
    this.editingId.set(id);
    this.showFormModal.set(true);
  }

  onSave(payload: FeatureExampleDraft) {
    const id = this.editingId();
    if (!id) {
      const created: FeatureExampleItem = {
        ...payload,
        id: `ex-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      };
      this.items.update((curr) => [created, ...curr]);
    } else {
      this.items.update((curr) => curr.map((x) => (x.id === id ? { ...x, ...payload } : x)));
    }
    this.closeFormModal();
  }

  openDetails(id: string) {
    this.selectedId.set(id);
    this.showDetailsModal.set(true);
  }

  closeDetails() {
    this.selectedId.set(null);
    this.showDetailsModal.set(false);
  }

  openDelete(id: string) {
    this.deletingId.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const id = this.deletingId();
    if (!id) return;
    this.items.update((curr) => curr.filter((x) => x.id !== id));
    if (this.selectedId() === id) this.closeDetails();
    this.showDeleteConfirm.set(false);
    this.deletingId.set(null);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.editingId.set(null);
  }

  statusLabel(status: FeatureExampleItem['status']): string {
    if (status === 'new') return 'Новая';
    if (status === 'done') return 'Готово';
    return 'В работе';
  }
}
