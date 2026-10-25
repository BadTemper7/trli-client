import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiOrigin, resolveSocketOrigin } from '../src/api/urlConfig.js';

test('deployment /api prefix is not duplicated', () => {
  assert.equal(resolveApiOrigin('https://testapi.onetrue.ph/api', ''), 'https://testapi.onetrue.ph');
  assert.equal(`${resolveApiOrigin('https://testapi.onetrue.ph/api', '')}/api/auth/login`, 'https://testapi.onetrue.ph/api/auth/login');
});
test('legacy variable is used when the new one is absent', () => {
  assert.equal(resolveApiOrigin('', 'http://localhost:5000/'), 'http://localhost:5000');
});
test('explicit new API variable takes precedence', () => {
  assert.equal(resolveApiOrigin('https://testapi.onetrue.ph/api', 'http://localhost:5000'), 'https://testapi.onetrue.ph');
});
test('Socket.IO URL uses its explicit origin, not the API path', () => {
  assert.equal(resolveSocketOrigin('https://testapi.onetrue.ph/', 'http://localhost:5000'), 'https://testapi.onetrue.ph');
  assert.equal(resolveSocketOrigin('', 'https://testapi.onetrue.ph/api'), 'https://testapi.onetrue.ph');
});
