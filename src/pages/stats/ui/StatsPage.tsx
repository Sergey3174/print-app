export function StatsPage() {
  return (
    <section className="flex flex-col gap-5 px-[18px] pb-[92px] pt-[18px] md:pb-24 md:pt-6">
      <header className="flex items-start justify-between gap-4 px-2 pt-1.5 text-white">
        <div>
          <p className="mb-2 text-[0.96rem] text-white/85">Hydration overview</p>
          <h1 className="m-0 text-[1.8rem] leading-none font-extrabold md:text-[2.1rem]">
            Stats
          </h1>
        </div>
      </header>

      <div className="grid min-h-[520px] place-items-center rounded-[34px] bg-[rgba(251,253,255,0.96)] px-6 py-10 text-center text-[#123053] shadow-[0_18px_45px_rgba(8,54,137,0.22)]">
        <div>
          <div className="mb-3 text-[0.8rem] font-extrabold tracking-[0.24em] text-[#0d6be8]">
            STATS
          </div>
          <h2 className="m-0 text-2xl font-extrabold text-[#15365f]">
            В разработке
          </h2>
        </div>
      </div>
    </section>
  );
}
