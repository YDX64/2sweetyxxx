import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield } from 'lucide-react';
import { VerificationModal } from '@/components/verification/VerificationModal';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useTranslation } from 'react-i18next';

interface VerificationSectionProps {
  verified: boolean;
  onVerificationComplete?: () => void;
}

export const VerificationSection: React.FC<VerificationSectionProps> = ({ 
  verified,
  onVerificationComplete 
}) => {
  const { t } = useTranslation();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  return (
    <>
      <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('features.verifiedBadge.title')}
              </CardTitle>
            </div>
            {verified && <VerifiedBadge size="lg" />}
          </div>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            {t('features.verifiedBadge.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verified ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    You are verified!
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Your profile shows the verified badge to other users.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {t('features.verifiedBadge.free')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get verified to show other users that you're a real person. The verification process is quick, easy, and completely free!
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => setShowVerificationModal(true)}
                    className="w-full sm:w-auto"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {t('verification.getVerified')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => {
          setShowVerificationModal(false);
          onVerificationComplete?.();
        }}
      />
    </>
  );
};