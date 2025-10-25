import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { paymentService, type PaymentOptions } from '@/services/paymentService';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

interface GooglePayButtonProps {
  options: PaymentOptions;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({
  options,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    loadGooglePayScript();
  }, []);

  useEffect(() => {
    if (scriptLoaded) {
      checkGooglePayAvailability();
    }
  }, [scriptLoaded]);

  const loadGooglePayScript = async () => {
    try {
      // Direct Google Pay script loading
      if (typeof window === 'undefined') {
        setScriptLoaded(false);
        return;
      }

      if (window.google?.payments?.api) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.warn('Google Pay script failed to load');
        setScriptLoaded(false);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Google Pay script loading failed:', error);
      setScriptLoaded(false);
    }
  };

  const checkGooglePayAvailability = async () => {
    try {
      const availableMethods = await paymentService.getAvailablePaymentMethods();
      setIsAvailable(availableMethods.includes('google_pay'));
    } catch (error) {
      console.error('Google Pay availability check failed:', error);
      setIsAvailable(false);
    }
  };

  const handleGooglePayClick = async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);
    
    try {
      const result = await paymentService.processPayment('google_pay', options);
      
      if (result.success) {
        toast({
          title: t('googlePaySuccess'),
          description: t('subscriptionActivated', { tier: options.tier.displayName }),
          variant: "default"
        });
        
        onSuccess?.();
      } else {
        throw new Error(result.error || t('googlePayFailed'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('googlePayFailed');
      
      toast({
        title: t('googlePayError'),
        description: errorMessage,
        variant: "destructive"
      });
      
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render if Google Pay is not available
  if (!isAvailable || !scriptLoaded) {
    return null;
  }

  return (
    <Button
      onClick={handleGooglePayClick}
      disabled={disabled || isProcessing}
      className={`
        relative h-12 w-full bg-white hover:bg-gray-50 text-gray-700 rounded-lg
        transition-all duration-200 border border-gray-300 shadow-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isProcessing ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
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
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="#4285F4"
            />
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="#34A853"
            />
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="#FBBC05"
            />
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-base font-medium">Pay</span>
        </div>
      )}
    </Button>
  );
};

export default GooglePayButton;