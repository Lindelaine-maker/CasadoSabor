import test from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler } from '../src/middleware.js';

function invoke(error) {
  const response = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  errorHandler(error, {}, response, () => {});
  return response;
}

test('returns conflict when deleting a category that still has dishes', () => {
  const response = invoke({ code: 'P2003' });
  assert.equal(response.statusCode, 409);
  assert.match(response.body.message, /pratos cadastrados/i);
});

test('returns conflict for duplicate category names', () => {
  const response = invoke({ code: 'P2002' });
  assert.equal(response.statusCode, 409);
});

test('returns not found when updating or deleting a missing record', () => {
  const response = invoke({ code: 'P2025' });
  assert.equal(response.statusCode, 404);
});

test('returns validation error for invalid input', () => {
  const response = invoke({
    name: 'ZodError',
    issues: [{ path: ['name'], message: 'Nome obrigatório' }],
  });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.errors[0].field, 'name');
});
