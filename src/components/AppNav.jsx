const VIEWS = [
  { id: 'subscriptions', label: 'Subscriptions', icon: '💳' },
  { id: 'bills', label: 'Bill Tracker', icon: '📋' },
];

export default function AppNav({ activeView, onNavigate }) {
  return (
    <nav
      className="flex gap-2 rounded-xl bg-slate-100 p-1"
      aria-label="Main navigation"
    >
      {VIEWS.map((view) => {
        const isActive = activeView === view.id;
        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onNavigate(view.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition sm:flex-none sm:px-6 ${
              isActive
                ? 'bg-white text-refai-teal-dark shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span aria-hidden>{view.icon}</span>
            {view.label}
          </button>
        );
      })}
    </nav>
  );
}
