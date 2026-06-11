import {
  Copy,
  Droplet,
  File,
  Folder,
  Plus,
  Settings,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";

type BottomNavItem = {
  to: string;
  icon: typeof Droplet;
  label: string;
  type?: "special";
  fillOnActive?: boolean;
};

const items: BottomNavItem[] = [
  { to: "/app", icon: File, label: "Home", fillOnActive: false },
  { to: "/app/statistics", icon: Folder, label: "Files", fillOnActive: false },
  { to: "/app/statistics", icon: Copy, label: "Xerox", fillOnActive: false },
  // {
  //   to: "/app/stats",
  //   icon: Plus,
  //   label: "Stats",
  //   type: "special",
  // },
  {
    to: "/app/profile",
    icon: User,
    label: "Account",
    fillOnActive: false,
  },
] as const;

export function BottomNav() {
  return (
    <footer className="absolute bottom-0 left-0 z-[2] grid w-full grid-cols-4 items-center justify-items-center bg-white/95 p-2 shadow-[0_14px_30px_rgba(11,55,134,0.18)]">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              item?.type === "special"
                ? `flex h-14 w-14 items-center justify-center self-center rounded-full ${
                    isActive
                      ? "bg-[#0d6be8] text-white"
                      : "bg-blue-600 text-white"
                  }`
                : `flex h-14 w-14 items-center justify-center self-center rounded-[18px] text-xs ${
                    isActive ? "text-gray-600" : "bg-transparent text-[#7d8ea4]"
                  }`
            }
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center">
                <span
                  className="relative flex items-center justify-center font-extrabold tracking-[0.22em]"
                  aria-hidden="true"
                >
                  <Icon
                    size={32}
                    fill={
                      isActive && item.fillOnActive ? "currentColor" : "none"
                    }
                  />
                </span>
                <span>{item.label}</span>
              </div>
            )}
          </NavLink>
        );
      })}
    </footer>
  );
}
