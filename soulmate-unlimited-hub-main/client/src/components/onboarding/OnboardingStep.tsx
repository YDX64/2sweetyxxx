import { ReactNode } from 'react';

interface OnboardingStepProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const OnboardingStep = ({ 
  children, 
  title, 
  subtitle, 
  className = "" 
}: OnboardingStepProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};