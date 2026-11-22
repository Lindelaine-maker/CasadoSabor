import test from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler } from '../src/middleware.js';

function invoke(error, headersSent = false) {
  const response = {
    headersSent,
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let nextError = null;
  errorHandler(error, {}, response, (value) => { nextError = value; });
  return { response, nextError };
}

test('returns conflict when deleting a category that still has dishes', () => {
  const { response } = invoke({ code: 'P2003' });
  assert.equal(response.statusCode, 409);
  assert.match(response.body.message, /pratos cadastrados/i);
});

test('returns conflict for duplicate category names', () => {
  const { response } = invoke({ code: 'P2002' });
  assert.equal(response.statusCode, 409);
});

test('returns not found when updating or deleting a missing record', () => {
  const { response } = invoke({ code: 'P2025' });
  assert.equal(response.statusCode, 404);
});

test('returns validation error for invalid input', () => {
  const { response } = invoke({
    name: 'ZodError',
    issues: [{ path: ['name'], message: 'Nome obrigatório' }],
  });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.errors[0].field, 'name');
});

test('returns 400 for malformed JSON request bodies', () => {
  const { response } = invoke({ type: 'entity.parse.failed', status: 400 });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /JSON inválido/i);
});

test('returns 413 when the request body exceeds the configured limit', () => {
  const { response } = invoke({ type: 'entity.too.large', status: 413 });
  assert.equal(response.statusCode, 413);
  assert.match(response.body.message, /limite permitido/i);
});

test('delegates errors after response headers have been sent', () => {
  const error = new Error('stream failure');
  const { response, nextError } = invoke(error, true);
  assert.equal(response.body, null);
  assert.equal(nextError, error);
});
