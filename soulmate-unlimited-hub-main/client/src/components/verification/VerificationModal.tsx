import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Phone, CreditCard, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type VerificationMethod = 'email' | 'phone' | 'id_document';

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationData, setVerificationData] = useState<any>({});

  const verificationMethods = [
    {
      id: 'email' as VerificationMethod,
      icon: Mail,
      title: t('verification.methods.email.title'),
      description: t('verification.methods.email.description'),
      available: true
    },
    {
      id: 'phone' as VerificationMethod,
      icon: Phone,
      title: t('verification.methods.phone.title'),
      description: t('verification.methods.phone.description'),
      available: true
    },
    {
      id: 'id_document' as VerificationMethod,
      icon: CreditCard,
      title: t('verification.methods.idDocument.title'),
      description: t('verification.methods.idDocument.description'),
      available: false // Coming soon
    }
  ];

  const handleSubmit = async () => {
    if (!selectedMethod || !user) return;

    setIsSubmitting(true);
    try {
      // Submit verification request
      const { error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          verification_type: selectedMethod,
          status: 'pending'
        });

      if (error) throw error;

      // For demo purposes, auto-approve email verification
      if (selectedMethod === 'email') {
        // Simulate email verification
        setTimeout(async () => {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ verified: true })
            .eq('id', user.id);

          if (!updateError) {
            toast.success(t('verification.success'));
            onSuccess?.();
            onClose();
          }
        }, 2000);
      } else {
        toast.success(t('verification.submitted'));
        onClose();
      }
    } catch (error) {
      toast.error(t('verification.error'));
      console.error('Verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('verification.title')}</DialogTitle>
          <DialogDescription>
            {t('verification.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!selectedMethod ? (
            <div className="space-y-3">
              {verificationMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => method.available && setSelectedMethod(method.id)}
                  disabled={!method.available}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-all",
                    method.available
                      ? "border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 cursor-pointer"
                      : "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <method.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {method.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {method.description}
                      </p>
                      {!method.available && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {t('verification.comingSoon')}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {selectedMethod === 'email' && t('verification.emailInstructions')}
                      {selectedMethod === 'phone' && t('verification.phoneInstructions')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMethod(null)}
                  disabled={isSubmitting}
                >
                  {t('common.back')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {t('verification.verifying')}
                    </span>
                  ) : (
                    t('verification.verify')
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};