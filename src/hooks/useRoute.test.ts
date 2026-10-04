import { describe, it, expect } from 'vitest';
import { parsePath, pathFor, STAFF_TABS } from './useRoute';

describe('parsePath', () => {
  it('maps / to landing', () => {
    expect(parsePath('/')).toEqual({ kind: 'landing' });
  });

  it('maps every staff tab', () => {
    for (const tab of STAFF_TABS) {
      expect(parsePath(`/staff/${tab}`)).toEqual({ kind: 'staff', tab });
    }
  });

  it('defaults /staff and unknown staff tabs to pos', () => {
    expect(parsePath('/staff')).toEqual({ kind: 'staff', tab: 'pos' });
    expect(parsePath('/staff/nope')).toEqual({ kind: 'staff', tab: 'pos' });
  });

  it('tolerates trailing slashes and uppercase', () => {
    expect(parsePath('/staff/kds/')).toEqual({ kind: 'staff', tab: 'kds' });
    expect(parsePath('/Staff/KDS')).toEqual({ kind: 'staff', tab: 'kds' });
  });

  it('sends any other path to landing', () => {
    expect(parsePath('/anything')).toEqual({ kind: 'landing' });
    expect(parsePath('/menu/burgers')).toEqual({ kind: 'landing' });
  });
});

describe('pathFor', () => {
  it('round-trips every route', () => {
    const routes = [{ kind: 'landing' as const }, ...STAFF_TABS.map((tab) => ({ kind: 'staff' as const, tab }))];
    for (const route of routes) {
      expect(parsePath(pathFor(route))).toEqual(route);
    }
  });

  it('produces canonical paths', () => {
    expect(pathFor({ kind: 'landing' })).toBe('/');
    expect(pathFor({ kind: 'staff', tab: 'orders' })).toBe('/staff/orders');
  });
});
