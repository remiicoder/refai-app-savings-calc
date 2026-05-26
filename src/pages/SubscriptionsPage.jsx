import { useCallback, useMemo } from 'react';
import CancelledSection from '../components/CancelledSection';
import ConfirmationModal from '../components/ConfirmationModal';
import SavingsTracker from '../components/SavingsTracker';
import SubscriptionCard from '../components/SubscriptionCard';
import { STATUS } from '../data/initialSubscriptions';
import { useState } from 'react';

export default function SubscriptionsPage({
  subscriptions,
  setSubscriptions,
  lifetimeSavings,
  setLifetimeSavings,
  subscriptionMonthlySavings,
}) {
  const [modal, setModal] = useState(null);

  const { activeAndPaused, cancelled } = useMemo(() => {
    const activeAndPaused = subscriptions.filter(
      (s) => s.status !== STATUS.CANCELLED,
    );
    const cancelled = subscriptions.filter((s) => s.status === STATUS.CANCELLED);
    return { activeAndPaused, cancelled };
  }, [subscriptions]);

  const annualSavings = subscriptionMonthlySavings * 12;

  const updateSubscription = useCallback((id, status) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s)),
    );
  }, [setSubscriptions]);

  const openModal = (subscription, action) => {
    setModal({ subscription, action });
  };

  const closeModal = () => setModal(null);

  const handleConfirm = () => {
    if (!modal) return;
    const { subscription, action } = modal;

    if (action === 'pause') {
      updateSubscription(subscription.id, STATUS.PAUSED);
      setLifetimeSavings((prev) => prev + subscription.monthlyCost);
    } else if (action === 'cancel') {
      updateSubscription(subscription.id, STATUS.CANCELLED);
      if (subscription.status === STATUS.ACTIVE) {
        setLifetimeSavings((prev) => prev + subscription.monthlyCost);
      }
    }

    closeModal();
  };

  const handleReactivate = (subscription) => {
    updateSubscription(subscription.id, STATUS.ACTIVE);
    setLifetimeSavings((prev) => Math.max(0, prev - subscription.monthlyCost));
  };

  return (
    <>
      <SavingsTracker
        monthlySavings={subscriptionMonthlySavings}
        annualSavings={annualSavings}
        lifetimeSavings={lifetimeSavings}
      />

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your subscriptions</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {activeAndPaused.length} total
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeAndPaused.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onPause={(s) => openModal(s, 'pause')}
              onCancel={(s) => openModal(s, 'cancel')}
              onReactivate={handleReactivate}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <CancelledSection subscriptions={cancelled} />
      </div>

      <ConfirmationModal
        open={Boolean(modal)}
        subscription={modal?.subscription}
        action={modal?.action}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />
    </>
  );
}
