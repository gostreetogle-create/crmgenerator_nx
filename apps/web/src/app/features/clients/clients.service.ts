import { Injectable, signal } from '@angular/core';
import { Client } from './client.model';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  readonly clients = signal<Client[]>([
    {
      _id: 'c1',
      name: 'ООО Альфа',
      contactPerson: 'Иван Петров',
      phone: '+7 900 111-22-33',
      email: 'alpha@example.com',
      inn: '7701234567',
      discount: 5,
      clientMarkup: 8,
      address: 'Москва, ул. Ленина, 1',
    },
    {
      _id: 'c2',
      name: 'ИП Смирнов',
      contactPerson: 'Смирнов Андрей',
      phone: '+7 900 222-33-44',
      email: 'smirnov@example.com',
      inn: '781234567890',
      discount: 3,
      clientMarkup: 10,
      notes: 'Постоянный клиент',
    },
    {
      _id: 'c3',
      name: 'АО Вектор',
      contactPerson: 'Мария Кузнецова',
      phone: '+7 900 333-44-55',
      email: 'vector@example.com',
      inn: '7723456789',
      kpp: '772301001',
      discount: 7,
      clientMarkup: 6,
      requisites: 'р/с 40702810...',
    },
  ]);

  addClient(data: Omit<Client, '_id'>) {
    const newClient: Client = {
      ...data,
      _id: crypto.randomUUID(),
    };
    this.clients.update((list) => [newClient, ...list]);
  }

  updateClient(id: string, data: Partial<Client>) {
    this.clients.update((list) =>
      list.map((c) => (c._id === id ? { ...c, ...data } : c))
    );
  }

  removeClient(id: string) {
    this.clients.update((list) => list.filter((c) => c._id !== id));
  }
}
