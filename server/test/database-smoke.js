import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const unique = `CI smoke ${Date.now()}`;
let category;

try {
  category = await prisma.category.create({ data: { name: unique } });
  assert.ok(category.id);

  const dish = await prisma.dish.create({
    data: {
      name: 'Prato de teste',
      description: 'Registro temporário para validar CRUD',
      price: '12.34',
      available: true,
      categoryId: category.id,
    },
  });
  assert.equal(dish.categoryId, category.id);

  const found = await prisma.dish.findUnique({ where: { id: dish.id } });
  assert.equal(found.name, 'Prato de teste');

  const updated = await prisma.dish.update({
    where: { id: dish.id },
    data: { available: false },
  });
  assert.equal(updated.available, false);

  await prisma.dish.delete({ where: { id: dish.id } });
  await prisma.category.delete({ where: { id: category.id } });
  category = null;

  console.log('PostgreSQL CRUD smoke test passed.');
} finally {
  if (category) {
    await prisma.dish.deleteMany({ where: { categoryId: category.id } });
    await prisma.category.delete({ where: { id: category.id } });
  }
  await prisma.$disconnect();
}
