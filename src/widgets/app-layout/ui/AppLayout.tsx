import { Outlet } from "react-router-dom";
import { MobileShell } from "../../mobile-shell/ui/MobileShell";
import { BottomNav } from "../../bottom-nav/ui/BottomNav";

export function AppLayout() {
  return (
    <MobileShell footer={<BottomNav />}>
      <Outlet />
    </MobileShell>
  );
}
