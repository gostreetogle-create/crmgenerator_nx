import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '@ui-kit/button';
import { CardComponent } from '@ui-kit/card';
import { ConfirmDialogComponent } from '@ui-kit/confirm-dialog';
import { InputComponent } from '@ui-kit/input';
import { Client } from './client.model';
import { ClientFormComponent } from './client-form.component';
import { ClientsService } from './clients.service';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    ClientFormComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.scss',
})
export class ClientsPageComponent {
  private readonly clientsService = inject(ClientsService);

  readonly clients = this.clientsService.clients;
  readonly searchQuery = signal<string>('');
  readonly sortBy = signal<'name' | 'discount' | null>(null);
  readonly sortAsc = signal<boolean>(true);
  readonly showModal = signal(false);
  readonly editingClient = signal<Client | null>(null);
  readonly showConfirm = signal(false);
  readonly deletingId = signal<string | null>(null);

  readonly filteredClients = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.clients();
    if (q) {
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.inn && c.inn.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q))
      );
    }

    const sort = this.sortBy();
    if (sort) {
      list = [...list].sort((a, b) => {
        const va = sort === 'name' ? a.name.toLowerCase() : (a.discount || 0);
        const vb = sort === 'name' ? b.name.toLowerCase() : (b.discount || 0);
        if (va < vb) return this.sortAsc() ? -1 : 1;
        if (va > vb) return this.sortAsc() ? 1 : -1;
        return 0;
      });
    }

    return list;
  });

  onOpenModal(client?: Client) {
    if (client) {
      this.editingClient.set(client);
    } else {
      this.editingClient.set(null);
    }
    this.showModal.set(true);
  }

  onSave(data: Partial<Client>) {
    const editing = this.editingClient();
    if (!data.name?.trim()) return;

    if (editing?._id) {
      this.clientsService.updateClient(editing._id, data);
    } else {
      this.clientsService.addClient({
        name: data.name.trim(),
        inn: data.inn,
        kpp: data.kpp,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        requisites: data.requisites,
        address: data.address,
        notes: data.notes,
        discount: data.discount,
        clientMarkup: data.clientMarkup,
      });
    }

    this.showModal.set(false);
    this.editingClient.set(null);
  }

  onDelete(id: string) {
    this.deletingId.set(id);
    this.showConfirm.set(true);
  }

  onConfirmDelete() {
    const id = this.deletingId();
    if (!id) return;
    this.clientsService.removeClient(id);
    this.showConfirm.set(false);
    this.deletingId.set(null);
  }

  toggleSort(field: 'name' | 'discount') {
    if (this.sortBy() === field) {
      this.sortAsc.set(!this.sortAsc());
    } else {
      this.sortBy.set(field);
      this.sortAsc.set(true);
    }
  }
}
