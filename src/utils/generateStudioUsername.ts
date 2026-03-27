import { Studio } from '../models/Studio';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function generateUniqueStudioUsername(name: string) {
  const baseUsername = slugify(name);

  let username = baseUsername;
  let counter = 2;

  while (true) {
    const existingStudio = await Studio.findOne({
      where: { username },
    });

    if (!existingStudio) {
      return username;
    }

    username = `${baseUsername}-${counter}`;
    counter++;
  }
}