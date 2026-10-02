"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { matchRoute, type AppRoute } from "./routes";

interface LocationState {
  path: string;
  search: URLSearchParams;
}

interface RouterValue extends LocationState {
  route: AppRoute;
}

const RouterContext = createContext<RouterValue | null>(null);

function readLocation(): LocationState {
  const hash = window.location.hash.replace(/^#/, "");
  const raw = hash.startsWith("/") ? hash : `${window.location.pathname}${window.location.search}`;
  const queryIndex = raw.indexOf("?");
  const path = (queryIndex >= 0 ? raw.slice(0, queryIndex) : raw) || "/";
  const search = new URLSearchParams(queryIndex >= 0 ? raw.slice(queryIndex + 1) : "");
  return { path, search };
}

export function navigate(to: string): void {
  const hash = `#${to.startsWith("/") ? to : `/${to}`}`;
  if (window.location.hash === hash) {
    window.dispatchEvent(new Event("tv-nav"));
    return;
  }
  window.location.hash = hash;
}

export function replaceHash(to: string): void {
  window.history.replaceState(null, "", `#${to.startsWith("/") ? to : `/${to}`}`);
  window.dispatchEvent(new Event("tv-nav"));
}

export function goBack(fallback = "/"): void {
  if (window.history.length > 1) window.history.back();
  else navigate(fallback);
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationState>(readLocation);
  useEffect(() => {
    const sync = () => {
      setLocation(readLocation());
      window.scrollTo(0, 0);
    };
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    window.addEventListener("tv-nav", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener("tv-nav", sync);
    };
  }, []);
  const value = { ...location, route: matchRoute(location.path) };
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const value = useContext(RouterContext);
  if (!value) throw new Error("Router is missing");
  return value;
}

export function Link({ href, className, children, onClick }: { href: string; className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <a
      href={`#${href}`}
      className={className}
      onClick={() => onClick?.()}
    >
      {children}
    </a>
  );
}
