import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({
  breadcrumbs,
  actions,
  children,
}: {
  breadcrumbs: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Topbar breadcrumbs={breadcrumbs} actions={actions} />
        <div className="p-8 max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
