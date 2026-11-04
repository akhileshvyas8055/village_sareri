const PageLoadingSkeleton = () => (
  <section
    className="w-full min-h-[65vh] px-4 py-6 sm:px-6 sm:py-10"
    role="status"
    aria-live="polite"
    aria-label="पेज लोड हो रहा है"
  >
    <span className="sr-only">पेज खुल रहा है, जानकारी लोड हो रही है…</span>
    <div className="mx-auto max-w-7xl animate-pulse">
      <div className="h-36 sm:h-52 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
      <div className="mt-6 h-8 w-2/3 max-w-md rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-4 w-full max-w-2xl rounded bg-slate-200/80 dark:bg-slate-800/80" />
      <div className="mt-2 h-4 w-4/5 max-w-xl rounded bg-slate-200/70 dark:bg-slate-800/70" />
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-36 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-4 h-3 w-full rounded bg-slate-100 dark:bg-slate-700/80" />
            <div className="mt-2 h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-700/80" />
            <div className="mt-5 h-7 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PageLoadingSkeleton;
