import { useCallback, useEffect, useState } from 'react';

export const STAFF_TABS = ['pos', 'kds', 'inventory', 'orders', 'analytics'] as const;
export type StaffTab = (typeof STAFF_TABS)[number];

export type Route = { kind: 'landing' } | { kind: 'staff'; tab: StaffTab };

function isStaffTab(value: string): value is StaffTab {
  return (STAFF_TABS as readonly string[]).includes(value);
}

export function parsePath(pathname: string): Route {
  const parts = pathname.toLowerCase().split('/').filter(Boolean);
  if (parts[0] !== 'staff') return { kind: 'landing' };
  const tab = parts[1] ?? '';
  return { kind: 'staff', tab: isStaffTab(tab) ? tab : 'pos' };
}

export function pathFor(route: Route): string {
  return route.kind === 'landing' ? '/' : `/staff/${route.tab}`;
}

/**
 * Minimal history routing. Reads window.location.pathname once, keeps the
 * address bar canonical, and follows the back/forward buttons.
 */
export function useRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parsePath(window.location.pathname));

  useEffect(() => {
    const canonical = pathFor(parsePath(window.location.pathname));
    if (window.location.pathname !== canonical) {
      window.history.replaceState(null, '', canonical);
    }
    const onPopState = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((next: Route) => {
    const path = pathFor(next);
    if (path !== window.location.pathname) {
      window.history.pushState(null, '', path);
    }
    setRoute(next);
    window.scrollTo({ top: 0 });
  }, []);

  return [route, navigate];
}
