import AppNav from './AppNav';

export default function AppLayout({
  activeView,
  onNavigate,
  title,
  subtitle,
  onResetClick,
  children,
}) {
  return (
    <div className="min-h-screen bg-refai-surface">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/refai-logo.png"
                alt="refai.app"
                className="h-9 w-auto sm:h-10"
              />
              <div>
                <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              {subtitle && (
                <p className="text-sm text-slate-500 sm:text-right">{subtitle}</p>
              )}
              {onResetClick && (
                <button
                  type="button"
                  onClick={onResetClick}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:self-auto"
                >
                  <span aria-hidden>↺</span>
                  Start new scenario
                </button>
              )}
            </div>
          </div>
          <div className="mt-4">
            <AppNav activeView={activeView} onNavigate={onNavigate} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
