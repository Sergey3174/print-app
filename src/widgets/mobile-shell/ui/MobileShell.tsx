import type { PropsWithChildren, ReactNode } from "react";

type MobileShellProps = PropsWithChildren<{
  footer?: ReactNode;
  mascot?: ReactNode;
}>;

export function MobileShell({ children, footer, mascot }: MobileShellProps) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.18),transparent_20%),radial-gradient(circle_at_80%_85%,rgba(180,180,180,0.2),transparent_24%),linear-gradient(180deg,#ffffff_0%,#f0f0f0_45%,#c8c8c8_100%)] px-0 md:px-4">
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden md:border md:border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.25),rgba(0,0,0,0.06))] md:max-w-[768px] md:rounded-[18px]">
        {/* <div className="absolute -right-[30px] -top-10 h-[180px] w-[180px] rounded-full bg-white/40 blur-md" />
        <div className="absolute -bottom-[70px] -left-[50px] h-[140px] w-[220px] rounded-full bg-black/10 blur-md" /> */}
        {mascot}
        <div className="relative z-[2] flex min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}
