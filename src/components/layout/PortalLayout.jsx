import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function PortalLayout() {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <SiteHeader />
      <main className="app-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <Outlet />
        </div>
        <SiteFooter />
      </main>
    </div>
  );
}
