import AppNav from './AppNav';

export default function AppLayout({ activeView, onNavigate, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-refai-surface">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-refai-teal text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-refai-teal">
                  Refai
                </p>
                <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
              </div>
            </div>
            {subtitle && (
              <p className="text-sm text-slate-500 sm:text-right">{subtitle}</p>
            )}
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
