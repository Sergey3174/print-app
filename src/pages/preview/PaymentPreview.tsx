import { ChevronLeft, Printer } from "lucide-react";
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
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-right text-sm font-semibold text-gray-900">
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
      <section className="flex min-h-0 flex-1 flex-col bg-[#f8f8f8]">
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
          <button
            className="flex items-center gap-1 text-sm font-medium text-gray-800"
            onClick={() => navigate("/app/preview")}
          >
            <ChevronLeft size={18} /> Payment Details
          </button>
          {/* <button className="text-gray-500">
            <Share2 size={18} />
          </button> */}
        </div>

        <div className="flex-1 overflow-auto px-3 py-3">
          <div className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="border-b border-dashed border-gray-200 pb-3">
              <p className="break-all text-lg font-bold text-gray-900">
                {payment.fileName}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Print reservation summary
              </p>
            </div>

            <div className="divide-y divide-gray-100">
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
              <DetailRow label="Per sheet" value={`${payment.pagesPerSheet}`} />
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
              <span className="text-base font-semibold text-gray-900">
                Total
              </span>
              <span className="text-xl font-bold text-rose-400">
                $ {payment.totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="mt-5 flex justify-center">
              <div className="w-[210px]">
                <div className="rounded-[18px] bg-white p-3 shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
                  <img
                    src={MOCK_QR_BASE64}
                    alt="Mock payment QR code"
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              Show this QR code at the printer to continue payment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-white px-4 py-4">
          <button
            type="button"
            onClick={() => navigate("/app/preview")}
            className="rounded-2xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700"
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
            className="flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-sm font-semibold text-white"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </section>
    </MobileShell>
  );
}
