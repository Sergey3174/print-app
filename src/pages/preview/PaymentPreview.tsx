import { useEffect, useState, type ReactNode } from "react";
import {
  ChevronLeft,
  CreditCard,
  FileText,
  Layers3,
  Palette,
  Printer,
  QrCode,
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

type PaymentMethod = "none" | "sbp" | "card";

const MOCK_QR_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMjUwIiB2aWV3Qm94PSIwIDAgMjUwIDI1MCI+PHJlY3Qgd2lkdGg9IjI1MCIgaGVpZ2h0PSIyNTAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTcwIiB5PSIxMCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE4MCIgeT0iMjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIxOTAiIHk9IjMwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTAiIHk9IjE3MCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjIwIiB5PSIxODAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0id2hpdGUiLz48cmVjdCB4PSIzMCIgeT0iMTkwIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMjAiIHk9IjEwMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE0MCIgeT0iMTAwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTAwIiB5PSIxMjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMjAiIHk9IjEyMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE2MCIgeT0iMTIwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iOTAiIHk9IjE0MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjExMCIgeT0iMTQwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTMwIiB5PSIxNDAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxNTAiIHk9IjE0MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE3MCIgeT0iMTQwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTAwIiB5PSIxNjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSIxMjAiIHk9IjE2MCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJibGFjayIvPjxyZWN0IHg9IjE0MCIgeT0iMTYwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9ImJsYWNrIi8+PC9zdmc+";

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/35 p-4 backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-2 text-[#006876]">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#454652]">
          {label}
        </span>
      </div>
      <span className="text-lg font-bold text-[#1b1c1c]">{value}</span>
    </div>
  );
}

function WaitingPayment() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full bg-[#1a237e] opacity-30 animate-[paymentPulse_1.5s_cubic-bezier(0.45,0,0.55,1)_infinite]" />
        <div className="absolute left-1/4 top-1/4 h-6 w-6 rounded-full bg-[#1a237e] shadow-[0_0_12px_rgba(26,35,126,0.3)] animate-[paymentDot_1.5s_cubic-bezier(0.45,0,0.55,1)_infinite]" />
      </div>
      <p className="text-base font-semibold text-[#1a237e] animate-[paymentText_2s_ease-in-out_infinite]">
        Waiting for payment...
      </p>
    </div>
  );
}

export function PaymentPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const payment = location.state as PaymentPreviewState | null;
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>("none");

  useEffect(() => {
    if (activeMethod !== "card" || !payment) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/app/print-success", {
        state: {
          fileName: payment.fileName,
          selectedPagesCount: payment.selectedPagesCount,
          totalPrice: payment.totalPrice,
        },
      });
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeMethod, navigate, payment]);

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
      <section className="flex min-h-0 flex-1 flex-col overflow-auto bg-[linear-gradient(135deg,#fbf9f8_0%,#e0e0ff_100%)]">
        <header className="sticky top-0 z-10 flex shrink-0 h-14 items-center justify-between bg-transparent px-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Go back"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#000666] transition active:scale-95"
              onClick={() => navigate("/app/preview")}
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-[#1b1c1c]">
              Payment Details
            </h1>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-4 pb-10">
          <div className="rounded-[28px] border border-white/30 bg-white/70 p-6 shadow-[0_8px_32px_rgba(26,35,126,0.05)] backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a237e] shadow-lg">
                <FileText size={32} className="text-white" />
              </div>
              <h2 className="mt-3 line-clamp-2 max-w-full text-xl font-semibold text-[#000666]">
                {payment.fileName}
              </h2>
              <div className="mt-1 flex flex-col items-center">
                <span className="text-sm font-semibold text-[#454652]">
                  Printer payment
                </span>
                <span className="text-xs text-[#454652]/70">
                  Continue with a convenient payment method
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <InfoTile
                icon={<FileText size={18} />}
                label="Total"
                value={`${payment.totalPages} Pages`}
              />
              <InfoTile
                icon={<Printer size={18} />}
                label="Printing"
                value={`${payment.selectedPagesCount} Pages`}
              />
              <InfoTile
                icon={<Palette size={18} />}
                label="Type"
                value={payment.type}
              />
              <InfoTile
                icon={<Layers3 size={18} />}
                label="Sides"
                value={payment.sides}
              />
            </div>

            <div className="mt-8 rounded-2xl border border-[#1a237e]/10 bg-[#e0e0ff]/35 p-6 shadow-[0_8px_32px_rgba(26,35,126,0.05)]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#454652]">
                  Total Amount
                </span>
                <div className="text-4xl font-extrabold text-[#000666]">
                  <span className="mr-1 text-2xl">Rp</span>
                  {payment.totalPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-[#c6c5d4]/50 pt-6">
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setActiveMethod("card")}
                  className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#1a237e]/20 bg-[#1a237e]/10 px-6 transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} className="text-[#000666]" />
                    <span className="font-semibold text-[#1b1c1c]">
                      Bank Card
                    </span>
                  </div>
                  <span className="text-xl text-[#000666]/40">›</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod("sbp")}
                  className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#006876]/20 bg-[#006876]/5 px-6 transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <QrCode size={20} className="text-[#006876]" />
                    <span className="font-semibold text-[#1b1c1c]">Qris</span>
                  </div>
                  <span className="text-xl text-[#006876]/40">›</span>
                </button>
              </div>

              {activeMethod === "card" ? <WaitingPayment /> : null}

              {activeMethod === "sbp" ? (
                <div className="mt-6 flex flex-col items-center rounded-[24px] border border-white/40 bg-white/45 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                  <div className="rounded-[20px] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.05),0_8px_24px_rgba(15,23,42,0.08)]">
                    <img
                      src={MOCK_QR_BASE64}
                      alt="SBP payment QR"
                      className="h-auto w-52"
                    />
                  </div>
                  <p className="mt-5 text-center text-sm leading-6 text-[#454652]">
                    Scan this QR with your banking app.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </main>

        <style>{`
          @keyframes paymentPulse {
            0% { transform: scale(.33); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: scale(1.1); opacity: 0; }
          }

          @keyframes paymentDot {
            0% { transform: scale(.8); opacity: 0.8; }
            50% { transform: scale(1); opacity: 1; }
            100% { transform: scale(.8); opacity: 0.8; }
          }

          @keyframes paymentText {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </section>
    </MobileShell>
  );
}
