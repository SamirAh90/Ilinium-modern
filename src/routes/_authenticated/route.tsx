import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { backend } from "@/lib/backend";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await backend.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
