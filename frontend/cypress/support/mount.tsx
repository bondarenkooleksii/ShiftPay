import React from 'react';
import { mount } from 'cypress/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../src/api/auth';
import { AppStateProvider, useAppState } from '../../src/app/AppStateProvider';
import { db } from '../../src/mocks/server/db';
import { tokenStorage } from '../../src/shared/api/client';
import type { UserRole } from '../../src/types';
import { apiCalls } from './api';

const ACCOUNT_BY_ROLE: Record<UserRole, string> = {
  owner: 'u-owner',
  admin: 'u-admin',
  employee: 'u-employee',
};

export function loginAs(role: UserRole) {
  const token = `test-token-${role}`;
  db.data.sessions[token] = ACCOUNT_BY_ROLE[role];
  db.commit();
  tokenStorage.set(token, true);
}

function LocationProbe() {
  const { pathname } = useLocation();
  return <output data-cy="location">{pathname}</output>;
}

function StateProbe() {
  const { user, status } = useAuth();
  const app = useAppState();
  return (
    <output data-cy="state" hidden>
      {JSON.stringify({
        status,
        role: user?.role ?? null,
        submitShift: app.isSubmitShiftOpen,
        addVenue: app.isAddVenueOpen,
      })}
    </output>
  );
}

interface MountOptions {
  role?: UserRole;
  path?: string;
  route?: string;
}

function Providers({ children, path, route }: { children: React.ReactNode } & MountOptions) {
  return (
    <MemoryRouter initialEntries={[path ?? '/']}>
      <AuthProvider>
        <AppStateProvider>
          {route ? (
            <Routes>
              <Route path={route} element={children} />
              <Route path="*" element={null} />
            </Routes>
          ) : (
            children
          )}
          <LocationProbe />
          <StateProbe />
        </AppStateProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

export function mountWithApp(ui: React.ReactNode, options: MountOptions = {}) {
  if (options.role) loginAs(options.role);
  mount(<Providers {...options}>{ui}</Providers>);
  if (options.role) {
    cy.get('[data-cy="state"]').should('contain', '"status":"authenticated"');
  }
}

export const location = () => cy.get('[data-cy="location"]');

export const appState = (key: string, value: unknown) =>
  cy.get('[data-cy="state"]').should('contain', `"${key}":${JSON.stringify(value)}`);

export const expectCall = (method: string, path: string, body?: Record<string, unknown>) =>
  cy.wrap(null).should(() => {
    const calls = apiCalls(method, path);
    expect(calls, `${method} ${path}`).to.have.length.greaterThan(0);
    if (body) expect(calls[calls.length - 1].body).to.deep.include(body);
  });

export { apiCalls };
export { failApi } from './api';
