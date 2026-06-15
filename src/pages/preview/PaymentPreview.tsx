import {
  ChevronLeft,
  EllipsisVertical,
  Printer,
  TimerReset,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileShell } from "../../widgets/mobile-shell/ui/MobileShell";

type PaymentPreviewState = {
  fileName: string;
  totalPages: number;
  selectedPagesCount: number;
  totalPrice: number;
  type: string;
  sides: string;
  pagesPerSheet: number;
};

const MOCK_QR_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMjUwIiB2aWV3Qm94PSIwIDAgMjUwIDI1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIyNTAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTcwIiB5PSIxMCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE4MCIgeT0iMjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIxOTAiIHk9IjMwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTAiIHk9IjE3MCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjIwIiB5PSIxODAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIzMCIgeT0iMTkwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMjAiIHk9IjEwMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE0MCIgeT0iMTAwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTAwIiB5PSIxMjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMjAiIHk9IjEyMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE2MCIgeT0iMTIwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iOTAiIHk9IjE0MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjExMCIgeT0iMTQwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTMwIiB5PSIxNDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxNTAiIHk9IjE0MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE3MCIgeT0iMTQwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTAwIiB5PSIxNjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMjAiIHk9IjE2MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE0MCIgeT0iMTYwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+PC9zdmc+";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[#667085]">{label}</span>
      <span className="text-right text-sm font-semibold text-[#101828]">
        {value}
      </span>
    </div>
  );
}

export function PaymentPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const payment = location.state as PaymentPreviewState | null;

  if (!payment) {
    return (
      <MobileShell>
        <section className="flex min-h-0 flex-1 flex-col bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
            <button
              className="flex items-center gap-1 text-sm font-medium text-gray-800"
              onClick={() => navigate("/app/preview")}
            >
              <ChevronLeft size={18} /> Back
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-gray-500">
            No payment data yet. Open Printing Preview first.
          </div>
        </section>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <section className="flex min-h-0 flex-1 flex-col bg-[#f4f6f8]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#101828] transition-colors hover:bg-black/5"
              onClick={() => navigate("/app/preview")}
            >
              <ChevronLeft size={18} />
            </button>
            <h1 className="truncate text-[20px] font-bold tracking-[-0.01em] text-[#101828]">
              Payment Details
            </h1>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#667085]"
            aria-label="More options"
          >
            <EllipsisVertical size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-4 pb-36 pt-6">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
              <div className="border-b border-black/8 px-4 py-4">
                <p className="break-all text-base font-semibold text-[#101828]">
                  {payment.fileName}
                </p>
                <p className="mt-1 text-xs font-medium tracking-[0.02em] text-[#667085]">
                  Print reservation summary
                </p>
              </div>

              <div className="space-y-4 px-4 py-4">
                <DetailRow
                  label="Document pages"
                  value={`${payment.totalPages}`}
                />
                <DetailRow
                  label="Pages to print"
                  value={`${payment.selectedPagesCount}`}
                />
                <DetailRow label="Type" value={payment.type} />
                <DetailRow label="Sides" value={payment.sides} />
                <DetailRow
                  label="Per sheet"
                  value={`${payment.pagesPerSheet}`}
                />
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-black/10 bg-white px-4 py-4">
                <span className="text-base font-semibold text-[#101828]">
                  Total
                </span>
                <span className="text-[28px] font-bold tracking-[-0.02em] text-[#d92d20]">
                  $ {payment.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <div className="relative flex aspect-square w-full items-center justify-center gap-5 overflow-hidden rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.12)]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-black/5 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-200/25 blur-3xl" />

                <div className="relative z-10 rounded-[22px] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05),0_8px_24px_rgba(15,23,42,0.08)]">
                  <img
                    src={MOCK_QR_BASE64}
                    alt="Mock payment QR code"
                    className="h-auto w-48 sm:w-56"
                  />
                </div>

                <div className="absolute bottom-6 z-10 flex items-center gap-2 rounded-full bg-[#eef2f6] px-4 py-2 text-[#475467]">
                  <TimerReset size={16} className="text-[#1570ef]" />
                  <span className="text-xs font-semibold">
                    Expires in 04:59
                  </span>
                </div>
              </div>

              <p className="mt-7 max-w-[280px] text-center text-sm leading-6 text-[#667085]">
                Show this QR code at the printer to continue payment.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-black/5 bg-white/90 px-4 py-4 backdrop-blur">
          <div className="mx-auto grid w-full max-w-[420px] grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate("/app/preview")}
              className="h-14 rounded-2xl border border-[#101828] bg-white text-sm font-semibold text-[#101828] transition-transform active:scale-[0.99]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("/app/print-success", {
                  state: {
                    fileName: payment.fileName,
                    selectedPagesCount: payment.selectedPagesCount,
                    totalPrice: payment.totalPrice,
                  },
                })
              }
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#111827] text-sm font-semibold text-white shadow-[0_14px_30px_rgba(17,24,39,0.18)] transition-transform active:scale-[0.99]"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}
