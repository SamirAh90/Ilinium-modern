# Routes

TanStack Router uses file-based routing. Every `.tsx` file in this directory defines a route, and `routeTree.gen.ts` is generated automatically by the Vite router plugin.

- `index.tsx` maps to `/`.
- `_authenticated/route.tsx` protects its child routes.
- `__root.tsx` provides the application shell and error boundaries.
- Layout routes render child pages through `<Outlet />`.

Do not edit `routeTree.gen.ts` manually.
