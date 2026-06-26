import { useEffect, useMemo, useRef } from "react";
import { FileText, Printer } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store/store";
import { loadTaskHistoryThunk } from "../../../entities/taskHistory/store/taskHistorySlice";
import { formatCurrency } from "../../../shared/lib/formatCurrency";

function formatHistoryDate(
  timestamp: string,
  locale: string,
  todayLabel: string,
  yesterdayLabel: string,
) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (diffMs < oneDay) {
    return todayLabel;
  }

  if (diffMs < oneDay * 2) {
    return yesterdayLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(new Date(timestamp));
}

function getHistoryBadge(type: string) {
  if (type === "PDF" || type === "DOCX" || type === "DOC") {
    return {
      label: type,
      className: "bg-emerald-100 text-emerald-700",
      icon: <FileText size={14} />,
    };
  }

  return {
    label: type,
    className: "bg-indigo-100 text-indigo-700",
    icon: <Printer size={14} />,
  };
}

function getPrintMode(colorMode: string, colorLabel: string, bwLabel: string) {
  if (colorMode === "color") {
    return colorLabel;
  }

  return bwLabel;
}

type PrintHistorySectionProps = {
  dateLocale: string;
  t: (key: string, options?: Record<string, unknown>) => string;
};

export function PrintHistorySection({
  dateLocale,
  t,
}: PrintHistorySectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const listRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const historyData = useSelector((state: RootState) => state.taskHistory.data);
  const isLoading = useSelector(
    (state: RootState) => state.taskHistory.isLoading,
  );
  const historyItems = historyData?.items ?? [];
  const hasNextPage =
    (historyData?.current_page ?? 0) < (historyData?.total_pages ?? 0);
  const nextPage = (historyData?.current_page ?? 0) + 1;

  const renderItems = useMemo(
    () => historyItems.filter((item) => item.status === "done"),
    [historyItems],
  );

  useEffect(() => {
    void dispatch(loadTaskHistoryThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!listRef.current || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isLoading) {
          void dispatch(
            loadTaskHistoryThunk({ page: nextPage, page_size: 20 }),
          );
        }
      },
      {
        root: listRef.current,
        rootMargin: "0px 100px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [dispatch, hasNextPage, isLoading, nextPage, renderItems.length]);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#101828]">
          {t("home.printHistory")}
        </h2>
      </div>

      {renderItems.length ? (
        <div
          ref={listRef}
          className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-24"
        >
          {renderItems.map((item) => {
            const documentType = item.document_type.toUpperCase();
            const badge = getHistoryBadge(documentType);
            const printMode = getPrintMode(
              item.color_mode,
              t("home.color"),
              t("home.bw"),
            );

            return (
              <article
                key={item.tid}
                className="min-w-[280px] snap-start rounded-[22px] border border-black/5 bg-white p-4 shadow-[0_6px_22px_rgba(17,24,39,0.06)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#1a237e]">{badge.icon}</span>
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-xs text-[#667085]">
                    {formatHistoryDate(
                      item.created_at,
                      dateLocale,
                      t("home.today"),
                      t("home.yesterday"),
                    )}
                  </span>
                </div>

                <h3 className="mt-4 truncate text-base font-semibold text-[#101828]">
                  {item.document_name}
                </h3>
                <p className="mt-1 truncate text-sm text-[#667085]">
                  {item.printer_name ?? "Printer not selected"}
                </p>
                <p className="mt-1 truncate text-xs text-[#98a2b3]">
                  {item.tid}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-black/6 pt-3">
                  <span className="text-xs text-[#667085]">
                    {t("common.pages", { count: item.pages_count })} /{" "}
                    {printMode}
                  </span>
                  <span className="text-lg font-bold text-[#1a237e]">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </article>
            );
          })}
          <div
            ref={sentinelRef}
            aria-hidden="true"
            className="h-px w-px shrink-0 opacity-0"
          />
        </div>
      ) : (
        <div className="rounded-[22px] border border-dashed border-black/10 bg-white px-5 py-10 text-center text-sm text-[#667085]">
          {t("home.noPrintHistory")}
        </div>
      )}
    </section>
  );
}
