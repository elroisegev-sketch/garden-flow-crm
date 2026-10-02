export type AppRoute =
  | { name: "home" }
  | { name: "documents" }
  | { name: "document-new" }
  | { name: "document"; id: string }
  | { name: "document-edit"; id: string }
  | { name: "present"; id: string }
  | { name: "browse"; category: string }
  | { name: "flights" }
  | { name: "flight-new" }
  | { name: "flight-edit"; id: string }
  | { name: "hotel" }
  | { name: "hotel-new" }
  | { name: "hotel-edit"; id: string }
  | { name: "insurance" }
  | { name: "insurance-new" }
  | { name: "insurance-edit"; id: string }
  | { name: "car" }
  | { name: "car-new" }
  | { name: "car-edit"; id: string }
  | { name: "attractions" }
  | { name: "attraction-new" }
  | { name: "attraction"; id: string }
  | { name: "attraction-edit"; id: string }
  | { name: "esim" }
  | { name: "esim-new" }
  | { name: "esim-edit"; id: string }
  | { name: "trip" }
  | { name: "trip-day"; id: string }
  | { name: "activity-new" }
  | { name: "activity-edit"; id: string }
  | { name: "favorites" }
  | { name: "checklist" }
  | { name: "settings" }
  | { name: "trip-new" }
  | { name: "trip-edit"; id: string }
  | { name: "traveler-new" }
  | { name: "traveler-edit"; id: string }
  | { name: "not-found" };

export function matchRoute(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return { name: "home" };
  if (path === "/documents") return { name: "documents" };
  if (path === "/documents/new") return { name: "document-new" };
  let match = path.match(/^\/documents\/([^/]+)\/edit$/);
  if (match) return { name: "document-edit", id: decodeURIComponent(match[1]) };
  match = path.match(/^\/documents\/([^/]+)$/);
  if (match) return { name: "document", id: decodeURIComponent(match[1]) };
  match = path.match(/^\/present\/([^/]+)$/);
  if (match) return { name: "present", id: decodeURIComponent(match[1]) };
  match = path.match(/^\/browse\/([^/]+)$/);
  if (match) return { name: "browse", category: decodeURIComponent(match[1]) };
  if (path === "/flights") return { name: "flights" };
  if (path === "/flights/new") return { name: "flight-new" };
  match = path.match(/^\/flights\/([^/]+)\/edit$/);
  if (match) return { name: "flight-edit", id: decodeURIComponent(match[1]) };
  if (path === "/hotel") return { name: "hotel" };
  if (path === "/hotel/new") return { name: "hotel-new" };
  match = path.match(/^\/hotel\/([^/]+)\/edit$/);
  if (match) return { name: "hotel-edit", id: decodeURIComponent(match[1]) };
  if (path === "/insurance") return { name: "insurance" };
  if (path === "/insurance/new") return { name: "insurance-new" };
  match = path.match(/^\/insurance\/([^/]+)\/edit$/);
  if (match) return { name: "insurance-edit", id: decodeURIComponent(match[1]) };
  if (path === "/car") return { name: "car" };
  if (path === "/car/new") return { name: "car-new" };
  match = path.match(/^\/car\/([^/]+)\/edit$/);
  if (match) return { name: "car-edit", id: decodeURIComponent(match[1]) };
  if (path === "/attractions") return { name: "attractions" };
  if (path === "/attractions/new") return { name: "attraction-new" };
  match = path.match(/^\/attractions\/([^/]+)\/edit$/);
  if (match) return { name: "attraction-edit", id: decodeURIComponent(match[1]) };
  match = path.match(/^\/attractions\/([^/]+)$/);
  if (match) return { name: "attraction", id: decodeURIComponent(match[1]) };
  if (path === "/esim") return { name: "esim" };
  if (path === "/esim/new") return { name: "esim-new" };
  match = path.match(/^\/esim\/([^/]+)\/edit$/);
  if (match) return { name: "esim-edit", id: decodeURIComponent(match[1]) };
  if (path === "/trip") return { name: "trip" };
  match = path.match(/^\/trip\/([^/]+)$/);
  if (match) return { name: "trip-day", id: decodeURIComponent(match[1]) };
  if (path === "/activity/new") return { name: "activity-new" };
  match = path.match(/^\/activity\/([^/]+)\/edit$/);
  if (match) return { name: "activity-edit", id: decodeURIComponent(match[1]) };
  if (path === "/favorites") return { name: "favorites" };
  if (path === "/checklist") return { name: "checklist" };
  if (path === "/settings") return { name: "settings" };
  if (path === "/trips/new") return { name: "trip-new" };
  match = path.match(/^\/trips\/([^/]+)\/edit$/);
  if (match) return { name: "trip-edit", id: decodeURIComponent(match[1]) };
  if (path === "/travelers/new") return { name: "traveler-new" };
  match = path.match(/^\/travelers\/([^/]+)\/edit$/);
  if (match) return { name: "traveler-edit", id: decodeURIComponent(match[1]) };
  return { name: "not-found" };
}

export function isMainTab(route: AppRoute): boolean {
  return route.name === "home" || route.name === "documents" || route.name === "trip" || route.name === "favorites" || route.name === "settings";
}

export function showsNavigation(route: AppRoute): boolean {
  return route.name !== "present" && !route.name.endsWith("-new") && !route.name.endsWith("-edit");
}
