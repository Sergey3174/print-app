import { Check, ChevronLeft, Printer } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileShell } from "../../widgets/mobile-shell/ui/MobileShell";
import PrintingAnimation from "../../features/auth/model/animation/SuccessRequest";

type PrintSuccessState = {
  fileName?: string;
  selectedPagesCount?: number;
  totalPrice?: number;
};

function FloatingTicket({
  className,
  title,
  items,
}: {
  className: string;
  title: string;
  items: string[];
}) {
  return (
    <div
      className={`absolute w-[70px] rounded-2xl border border-white/70 bg-white/90 p-2 shadow-[0_18px_32px_rgba(15,23,42,0.1)] backdrop-blur ${className}`}
    >
      <p className="truncate text-[7px] font-extrabold uppercase tracking-[0.18em] text-gray-400">
        {title}
      </p>
      <div className="mt-1 space-y-1">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-900" />
            <span className="truncate text-[8px] font-semibold text-gray-500">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PrintSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as PrintSuccessState | null) ?? {};

  const fileName = state.fileName ?? "Your document";
  const pagesCount = state.selectedPagesCount ?? 0;
  const totalPrice = state.totalPrice ?? 0;

  return (
    <MobileShell>
      <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f6f4f1]">
        <div className="relative flex flex-col flex-1 justify-end overflow-hidden">
          <div className="absolute inset-x-0 top-10 flex justify-center">
            <div className="h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.25)_45%,rgba(246,244,241,0)_72%)]" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <PrintingAnimation />
          </div>

          <FloatingTicket
            className="left-3 top-16 rotate-[-10deg]"
            title="Queued"
            items={["Pages ready", "Printer found", "Reserved"]}
          />
          <FloatingTicket
            className="right-3 top-22 rotate-[9deg]"
            title="Status"
            items={["Paid", "Uploaded", "Starting"]}
          />

          <div className="relative z-10 w-full rounded-t-[18px] border border-white/80 bg-white px-5 pb-6 pt-5 shadow-[0_24px_50px_rgba(15,23,42,0.12)]">
            <div className="mx-auto flex w-full  flex-col items-center rounded-[18px] bg-[linear-gradient(180deg,#ffffff_0%,#faf8f4_100%)] px-6 pb-5 pt-6 shadow-[0_16px_38px_rgba(15,23,42,0.08)]">
              <div className="flex h-18 w-18 items-center justify-center rounded-[24px] bg-[radial-gradient(circle_at_30%_30%,#4b4b4b_0%,#111111_60%,#000000_100%)] shadow-[0_14px_30px_rgba(17,17,17,0.28)]">
                <Check size={34} className="text-white" strokeWidth={3} />
              </div>
              <h1 className="mt-5 text-center text-[29px] font-extrabold tracking-[-0.03em] text-gray-950">
                Printing started
              </h1>
              <p className="mt-2 text-center text-sm leading-5 text-gray-500">
                {fileName} has been sent to the printer. Walk to the print point
                and pick it up in a moment.
              </p>
            </div>

            <div className="mt-6 rounded-[18px] bg-[#fbfaf7] px-4 py-3 text-center shadow-[inset_0_0_0_1px_rgba(17,24,39,0.05)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">
                Print summary
              </p>
              <div className="mt-2 flex items-center justify-center gap-3 text-sm font-semibold text-gray-700">
                <span>{pagesCount || 1} pages</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/app")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#171717] px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_28px_rgba(23,23,23,0.2)] transition-transform active:scale-[0.99]"
            >
              <Printer size={16} />
              Back to Home
            </button>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}
