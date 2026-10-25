import { Outlet } from "react-router-dom";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function PublicLayout() {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <SiteHeader />
      <main className="app-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
        <SiteFooter />
      </main>
    </div>
  );
}
