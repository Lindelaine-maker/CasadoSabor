import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../src/auth.js';

const secret = 'test-secret-with-at-least-thirty-two-characters';
process.env.JWT_SECRET = secret;

function invoke(token) {
  const req = { headers: token ? { authorization: `Bearer ${token}` } : {} };
  const response = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let nextCalled = false;
  requireAdmin(req, response, () => { nextCalled = true; });
  return { req, response, nextCalled };
}

test('rejects requests without a bearer token', () => {
  const { response, nextCalled } = invoke();
  assert.equal(response.statusCode, 401);
  assert.equal(nextCalled, false);
});

test('accepts a valid administrator token', () => {
  const token = jwt.sign({ role: 'admin' }, secret, {
    algorithm: 'HS256', expiresIn: '5m',
    issuer: 'casa-do-sabor-api', audience: 'casa-do-sabor-admin',
  });
  const { response, req, nextCalled } = invoke(token);
  assert.equal(response.statusCode, 200);
  assert.equal(req.admin.role, 'admin');
  assert.equal(nextCalled, true);
});

test('rejects a token without administrator role', () => {
  const token = jwt.sign({ role: 'visitor' }, secret, {
    algorithm: 'HS256', expiresIn: '5m',
    issuer: 'casa-do-sabor-api', audience: 'casa-do-sabor-admin',
  });
  const { response, nextCalled } = invoke(token);
  assert.equal(response.statusCode, 403);
  assert.equal(nextCalled, false);
});

test('rejects expired tokens', () => {
  const token = jwt.sign({ role: 'admin' }, secret, {
    algorithm: 'HS256', expiresIn: -1,
    issuer: 'casa-do-sabor-api', audience: 'casa-do-sabor-admin',
  });
  const { response, nextCalled } = invoke(token);
  assert.equal(response.statusCode, 401);
  assert.equal(nextCalled, false);
});
