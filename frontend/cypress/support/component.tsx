import '@cypress/code-coverage/support';
import { mount } from 'cypress/react';
import { getResponse } from 'msw';
import { handlers } from '../../src/mocks/server/handlers';
import { db } from '../../src/mocks/server/db';
import { queryCache } from '../../src/shared/api/queryCache';
import { tokenStorage } from '../../src/shared/api/client';
import { apiFailures, apiLog, takeFailure } from './api';
import '../../src/shared/styles/global.css';

Cypress.Commands.add('mount', mount);

const originalFetch = window.fetch.bind(window);
let inflight = 0;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const raw = input instanceof Request ? input.url : String(input);
  const url = new URL(raw, window.location.origin);
  if (!url.pathname.startsWith('/api/')) return originalFetch(input, init);

  const request = new Request(url, init);
  const body = init?.body ? JSON.parse(String(init.body)) : undefined;
  apiLog.push({ method: request.method, path: url.pathname + url.search, body });

  const failure = takeFailure(request.method, url.pathname + url.search);
  if (failure) return failure;
  inflight += 1;
  try {
    const response = await getResponse(handlers, request);
    return response ?? new Response(JSON.stringify({ message: 'not found' }), { status: 404 });
  } finally {
    inflight -= 1;
  }
};

afterEach(() => {
  cy.wrap(null, { log: false }).should(() => expect(inflight, 'pending API requests').to.eq(0));
});

beforeEach(() => {
  apiLog.length = 0;
  apiFailures.length = 0;
  window.localStorage.clear();
  window.sessionStorage.clear();
  tokenStorage.clear();
  db.data.sessions = {};
  db.reset();
  queryCache.clear();
});
