import { prisma } from './services/prisma';

const statuses: Array<{ key: string; name: string }> = [
  // товары
  { key: 'goods_ready', name: 'Укомплектованы данными' },

  // КП
  { key: 'proposal_waiting', name: 'Ожидание' },
  { key: 'proposal_approved', name: 'Согласовано' },
  { key: 'proposal_paid', name: 'Оплачено' },

  // Заказ (производственная цепочка) — пример под ваш список
  { key: 'order_planned', name: 'Спланировано' },
  { key: 'order_procured', name: 'Закуплено' },
  { key: 'order_designed', name: 'Спроектировано' },
  { key: 'order_manufactured', name: 'Изготовлено' },
  { key: 'order_shipped', name: 'Отгружено' },
];

export async function seedStatuses() {
  await Promise.all(
    statuses.map((s) =>
      prisma.status.upsert({
        where: { key: s.key },
        update: { name: s.name },
        create: { key: s.key, name: s.name },
      }),
    ),
  );
}

