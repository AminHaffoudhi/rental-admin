import type { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";

export function AdminLayout(): ReactElement {
  return (
    <div className="flex h-screen overflow-hidden bg-stone-100">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
