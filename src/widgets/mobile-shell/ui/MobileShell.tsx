import type { PropsWithChildren, ReactNode } from "react";

type MobileShellProps = PropsWithChildren<{
  header?: ReactNode;
  footer?: ReactNode;
  mascot?: ReactNode;
}>;

export function MobileShell({
  children,
  header,
  footer,
  mascot,
}: MobileShellProps) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center overflow-hidden px-0 md:px-4">
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden md:border md:border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.25),rgba(0,0,0,0.06))] md:max-w-[768px] md:rounded-[18px]">
        {/* <div className="absolute -right-[30px] -top-10 h-[180px] w-[180px] rounded-full bg-white/40 blur-md" />
        <div className="absolute -bottom-[70px] -left-[50px] h-[140px] w-[220px] rounded-full bg-black/10 blur-md" /> */}
        {mascot}
        <div className="absolute inset-x-0 top-0 z-[4]">{header}</div>
        <div className="relative z-[2] flex min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}
