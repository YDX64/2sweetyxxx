import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { BillingConfetti } from "./BillingConfetti";

interface BillingToggleProps {
  billingCycle: 'monthly' | 'yearly';
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
}

export const BillingToggle = ({ billingCycle, setBillingCycle }: BillingToggleProps) => {
  const { t } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-100 dark:bg-gray-800/80 p-1 rounded-lg border dark:border-gray-600/50 border-gray-200/70">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-3 rounded-md font-medium transition-all ${
            billingCycle === 'monthly'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          {t('monthly')}
        </button>
        <button
          onClick={() => {
            if (billingCycle !== 'yearly') {
              setShowConfetti(true);
            }
            setBillingCycle('yearly');
          }}
          className={`px-6 py-3 rounded-md font-medium transition-all relative ${
            billingCycle === 'yearly'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          {t('yearly')}
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            {t('discount40')}
          </span>
        </button>
      </div>
      
      {/* Confetti Effect */}
      <BillingConfetti 
        isVisible={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
    </div>
  );
};
