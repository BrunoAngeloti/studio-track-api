import { Category } from '../models/Category';

const DEFAULT_CATEGORIES: { name: string; color: string }[] = [
  { name: 'Serviços', color: '#22c55e' },
  { name: 'Produtos', color: '#3b82f6' },
  { name: 'Aluguel', color: '#f97316' },
  { name: 'Funcionários', color: '#a855f7' },
  { name: 'Marketing', color: '#ec4899' },
  { name: 'Outros', color: '#64748b' },
];

export async function seedDefaultCategories(studio_id: string) {
  await Category.bulkCreate(
    DEFAULT_CATEGORIES.map((category) => ({
      ...category,
      studio_id,
    }))
  );
}
