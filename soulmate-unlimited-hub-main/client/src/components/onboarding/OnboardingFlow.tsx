import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingStep } from "./OnboardingStep";
import { NameStep } from "./steps/NameStep";
import { BirthDateStep } from "./steps/BirthDateStep";
import { GenderStep } from "./steps/GenderStep";
import { OrientationStep } from "./steps/OrientationStep";
import { InterestedInStep } from "./steps/InterestedInStep";
import { RelationshipStep } from "./steps/RelationshipStep";
import { PhotoStep } from "./steps/PhotoStep";
import { useOnboardingLogic } from "./hooks/useOnboardingLogic";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  
  const {
    formData,
    updateFormData,
    saveProgress,
    completeOnboarding,
    isLoading,
    canProceed
  } = useOnboardingLogic();

  const handleNext = async () => {
    try {
      if (currentStep < totalSteps) {
        await saveProgress();
        setCurrentStep(prev => prev + 1);
      } else {
        console.log('Completing onboarding with form data:', formData);
        const startTime = Date.now();
        await completeOnboarding();
        const duration = Date.now() - startTime;
        console.log(`Onboarding completed successfully in ${duration}ms, calling onComplete callback`);
        onComplete();
      }
    } catch (error) {
      console.error('Error in onboarding handleNext:', error);
      // You might want to show an error toast here
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <NameStep
            value={formData.name}
            onChange={(value) => updateFormData('name', value)}
          />
        );
      case 2:
        return (
          <BirthDateStep
            value={formData.birth_date}
            onChange={(value) => updateFormData('birth_date', value)}
          />
        );
      case 3:
        return (
          <GenderStep
            value={formData.gender}
            onChange={(value) => updateFormData('gender', value)}
          />
        );
      case 4:
        return (
          <OrientationStep
            value={formData.sexual_orientation}
            onChange={(value) => updateFormData('sexual_orientation', value)}
          />
        );
      case 5:
        return (
          <InterestedInStep
            value={formData.interested_in}
            onChange={(value) => updateFormData('interested_in', value)}
          />
        );
      case 6:
        return (
          <RelationshipStep
            value={formData.relationship_type}
            onChange={(value) => updateFormData('relationship_type', value)}
          />
        );
      case 7:
        return (
          <PhotoStep
            photos={formData.photos}
            onChange={(photos) => updateFormData('photos', photos)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          {currentStep > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-4 w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1" />
        </div>

        {/* Main content card */}
        <div className="bg-white/80 dark:bg-gray-800/80 dark:border-gray-600/50 backdrop-blur-sm border rounded-2xl shadow-lg p-6 mb-6">
          {renderStep()}
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index + 1 <= currentStep
                  ? 'bg-pink-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Next button */}
        <Button
          onClick={handleNext}
          disabled={!canProceed(currentStep) || isLoading}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-2xl"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('onboarding.saving')}</span>
            </div>
          ) : currentStep === totalSteps ? (
            t('onboarding.complete')
          ) : (
            t('onboarding.continue')
          )}
        </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};