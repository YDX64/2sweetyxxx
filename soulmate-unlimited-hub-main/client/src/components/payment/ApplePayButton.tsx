import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { paymentService, type PaymentOptions } from '@/services/paymentService';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

interface ApplePayButtonProps {
  options: PaymentOptions;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  options,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkApplePayAvailability();
  }, []);

  const checkApplePayAvailability = async () => {
    try {
      const availableMethods = await paymentService.getAvailablePaymentMethods();
      setIsAvailable(availableMethods.includes('apple_pay'));
    } catch (error) {
      console.error('Apple Pay availability check failed:', error);
      setIsAvailable(false);
    }
  };

  const handleApplePayClick = async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    
    try {
      const result = await paymentService.processPayment('apple_pay', options);
      
      if (result.success) {
        toast({
          title: t('applePaySuccess'),
          description: t('subscriptionActivated', { tier: options.tier.displayName }),
          variant: "default"
        });
        
        onSuccess?.();
      } else {
        throw new Error(result.error || t('applePayFailed'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('applePayFailed');
      
      toast({
        title: t('applePayError'),
        description: errorMessage,
        variant: "destructive"
      });
      
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render if Apple Pay is not available
  if (!isAvailable) {
    return null;
  }

  return (
    <Button
      onClick={handleApplePayClick}
      disabled={disabled || isProcessing}
      className={`
        relative h-12 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg
        transition-all duration-200 border border-border
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        background: isProcessing 
          ? 'linear-gradient(135deg, #666 0%, #333 100%)'
          : 'linear-gradient(135deg, #000 0%, #333 100%)'
      }}
    >
      {isProcessing ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">{t('processing')}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"
              fill="currentColor"
            />
            <path
              d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"
              fill="currentColor"
            />
          </svg>
          <span className="text-base font-medium">Pay</span>
        </div>
      )}
    </Button>
  );
};

export default ApplePayButton;