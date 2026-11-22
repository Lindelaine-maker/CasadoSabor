import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import app from '../src/app.js';

const prisma = new PrismaClient();
const secret = 'integration-test-secret-at-least-thirty-two-characters';
process.env.JWT_SECRET = secret;

const token = jwt.sign({ role: 'admin', sub: 'integration-test' }, secret, {
  algorithm: 'HS256',
  expiresIn: '5m',
  issuer: 'casa-do-sabor-api',
  audience: 'casa-do-sabor-admin',
});
const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

test('HTTP integration: category and dish CRUD, validation, auth and constraints', async (t) => {
  const server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let categoryId;
  let dishId;

  t.after(async () => {
    if (categoryId) await prisma.dish.deleteMany({ where: { categoryId: categoryId } });
    if (dishId) await prisma.dish.deleteMany({ where: { id: dishId } });
    if (categoryId) await prisma.category.deleteMany({ where: { id: categoryId } });
    await new Promise(resolve => server.close(resolve));
    await prisma.$disconnect();
  });

  const categoryName = `Teste HTTP ${Date.now()}`;

  const noAuth = await fetch(`${base}/categories`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: categoryName }),
  });
  assert.equal(noAuth.status, 401);

  const createdCategoryResponse = await fetch(`${base}/categories`, {
    method: 'POST', headers: auth, body: JSON.stringify({ name: categoryName }),
  });
  assert.equal(createdCategoryResponse.status, 201);
  const category = await createdCategoryResponse.json();
  categoryId = category.id;
  assert.equal(category.name, categoryName);

  const getCategory = await fetch(`${base}/categories/${categoryId}`);
  assert.equal(getCategory.status, 200);
  assert.equal((await getCategory.json()).id, categoryId);

  const updateCategory = await fetch(`${base}/categories/${categoryId}`, {
    method: 'PUT', headers: auth, body: JSON.stringify({ name: `${categoryName} editada` }),
  });
  assert.equal(updateCategory.status, 200);
  assert.equal((await updateCategory.json()).name, `${categoryName} editada`);

  const duplicate = await fetch(`${base}/categories`, {
    method: 'POST', headers: auth, body: JSON.stringify({ name: `${categoryName} editada` }),
  });
  assert.equal(duplicate.status, 409);

  const invalidCategory = await fetch(`${base}/categories`, {
    method: 'POST', headers: auth, body: JSON.stringify({ name: 'x' }),
  });
  assert.equal(invalidCategory.status, 400);

  const createdDishResponse = await fetch(`${base}/categories/${categoryId}/dishes`, {
    method: 'POST', headers: auth,
    body: JSON.stringify({ name: 'Prato de teste', description: 'Teste de integração', price: 12.5, available: true }),
  });
  assert.equal(createdDishResponse.status, 201);
  const dish = await createdDishResponse.json();
  dishId = dish.id;
  assert.equal(dish.categoryId, categoryId);

  const invalidPrice = await fetch(`${base}/categories/${categoryId}/dishes`, {
    method: 'POST', headers: auth,
    body: JSON.stringify({ name: 'Preço inválido', price: 0 }),
  });
  assert.equal(invalidPrice.status, 400);

  const listDishes = await fetch(`${base}/categories/${categoryId}/dishes`);
  assert.equal(listDishes.status, 200);
  assert.ok((await listDishes.json()).some(item => item.id === dishId));

  const blockedDelete = await fetch(`${base}/categories/${categoryId}`, {
    method: 'DELETE', headers: auth,
  });
  assert.equal(blockedDelete.status, 409);

  const updateDish = await fetch(`${base}/dishes/${dishId}`, {
    method: 'PUT', headers: auth,
    body: JSON.stringify({ name: 'Prato atualizado', description: 'Atualizado', price: 15, available: false }),
  });
  assert.equal(updateDish.status, 200);
  const updatedDish = await updateDish.json();
  assert.equal(updatedDish.name, 'Prato atualizado');
  assert.equal(updatedDish.available, false);

  const deleteDish = await fetch(`${base}/dishes/${dishId}`, {
    method: 'DELETE', headers: auth,
  });
  assert.equal(deleteDish.status, 204);
  dishId = null;

  const deleteCategory = await fetch(`${base}/categories/${categoryId}`, {
    method: 'DELETE', headers: auth,
  });
  assert.equal(deleteCategory.status, 204);
  categoryId = null;
});
