import { useEffect } from "react";
import { Check, Printer } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { MobileShell } from "../../widgets/mobile-shell/ui/MobileShell";
import PrintingAnimation from "../../features/auth/model/animation/SuccessRequest";
import { formatCurrency } from "../../shared/lib/formatCurrency";
import type { AppDispatch, RootState } from "../../app/store/store";
import {
  clearTask,
  fetchPrintTaskStateThunk,
} from "../../entities/task/store/taskSlice";
import {
  clearSavedTaskEstimate,
  clearSavedTaskTid,
} from "../../shared/lib/taskRecovery";

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
      className={`absolute w-[84px] rounded-2xl border border-white/60 bg-white/80 p-2.5 shadow-[0_18px_32px_rgba(26,35,126,0.08)] backdrop-blur ${className}`}
    >
      <p className="truncate text-[7px] font-extrabold uppercase tracking-[0.18em] text-[#8690ee]">
        {title}
      </p>
      <div className="mt-1.5 space-y-1">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1a237e]" />
            <span className="truncate text-[8px] font-semibold text-[#454652]">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PrintSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const printState = useSelector((state: RootState) => state.task.printState);
  const task = useSelector((state: RootState) => state.task);
  const state = (location.state as PrintSuccessState | null) ?? {};

  const fileName =
    task.originalFileName ?? state.fileName ?? t("printSuccess.defaultDocument");
  const pagesCount = printState?.pages_count ?? state.selectedPagesCount ?? 0;
  const totalPrice = printState?.amount ?? state.totalPrice ?? 0;
  const isComplete = printState?.status === "done";

  useEffect(() => {
    void dispatch(fetchPrintTaskStateThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!printState || printState.status === "done") {
      return;
    }

    const intervalId = window.setInterval(() => {
      void dispatch(fetchPrintTaskStateThunk());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dispatch, printState]);

  return (
    <MobileShell>
      <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(135deg,#fbf9f8_0%,#e0e0ff_100%)]">
        <div className="relative flex flex-1 flex-col justify-end overflow-hidden">
          <div className="flex flex-1 items-center justify-center">
            {isComplete ? (
              <div className="flex h-32 w-32 items-center justify-center rounded-[32px] bg-[radial-gradient(circle_at_30%_30%,#8690ee_0%,#4c56af_55%,#1a237e_100%)] shadow-[0_20px_42px_rgba(26,35,126,0.28)]">
                <Check size={52} className="text-white" strokeWidth={3} />
              </div>
            ) : (
              <PrintingAnimation />
            )}
          </div>

          <FloatingTicket
            className="left-3 top-16 rotate-[-10deg]"
            title={isComplete ? t("printSuccess.done") : t("printSuccess.queued")}
            items={
              isComplete
                ? [
                    t("printSuccess.paid"),
                    t("printSuccess.printed"),
                    t("printSuccess.complete"),
                  ]
                : [
                    t("printSuccess.pagesReady"),
                    t("printSuccess.printerFound"),
                    t("printSuccess.reserved"),
                  ]
            }
          />
          <FloatingTicket
            className="right-3 top-22 rotate-[9deg]"
            title={t("printSuccess.status")}
            items={
              isComplete
                ? [
                    t("printSuccess.delivered"),
                    t("printSuccess.finished"),
                    t("printSuccess.ready"),
                  ]
                : [
                    t("printSuccess.paid"),
                    t("printSuccess.uploaded"),
                    t("printSuccess.starting"),
                  ]
            }
          />

          <div className="relative z-10 w-full rounded-t-[24px] border border-white/70 bg-white/82 px-5 pb-6 pt-5 shadow-[0_24px_50px_rgba(26,35,126,0.12)] backdrop-blur-xl">
            <div className="mx-auto flex w-full flex-col items-center rounded-[22px] bg-[linear-gradient(180deg,#ffffff_0%,#f7f7ff_100%)] px-6 pb-5 pt-6 shadow-[0_16px_38px_rgba(26,35,126,0.08)]">
              <div className="flex h-18 w-18 items-center justify-center rounded-[24px] bg-[radial-gradient(circle_at_30%_30%,#8690ee_0%,#4c56af_58%,#1a237e_100%)] shadow-[0_14px_30px_rgba(26,35,126,0.24)]">
                <Printer size={32} className="text-white" strokeWidth={2.4} />
              </div>
              <h1 className="mt-5 text-center text-[29px] font-extrabold tracking-[-0.03em] text-[#1a237e]">
                {isComplete
                  ? t("printSuccess.success")
                  : t("printSuccess.printingStarted")}
              </h1>
              <p className="mt-2 break-all text-center text-sm leading-5 text-[#454652]">
                {isComplete
                  ? t("printSuccess.readyMessage", { fileName })
                  : t("printSuccess.processingMessage", { fileName })}
              </p>
            </div>

            <div className="mt-6 rounded-[18px] bg-[#f5f3f3] px-4 py-3 text-center shadow-[inset_0_0_0_1px_rgba(76,86,175,0.08)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8690ee]">
                {t("printSuccess.summary")}
              </p>
              <div className="mt-2 flex items-center justify-center gap-3 text-sm font-semibold text-[#454652]">
                <span>{t("common.pages", { count: pagesCount || 1 })}</span>
                <span className="h-1 w-1 rounded-full bg-[#bdc2ff]" />
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                dispatch(clearTask());
                clearSavedTaskEstimate();
                clearSavedTaskTid();
                navigate("/app");
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#1a237e] px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_28px_rgba(26,35,126,0.22)] transition-transform active:scale-[0.99]"
            >
              <Printer size={16} />
              {t("printSuccess.backHome")}
            </button>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}
