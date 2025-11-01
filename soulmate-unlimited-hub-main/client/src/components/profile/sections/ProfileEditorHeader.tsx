
import { Button } from "@/components/ui/button";
import { Edit3, Save, X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ProfileEditorHeaderProps {
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onClose?: () => void;
}

export const ProfileEditorHeader = ({
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  onClose
}: ProfileEditorHeaderProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
          {t('myProfile')}
        </h1>
        <p className="text-gray-600 mt-1">{t('editProfileDescription')}</p>
      </div>
      
      <div className="flex items-center gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            {t('closeText')}
          </Button>
        )}
        
        {!isEditing ? (
          <Button onClick={onEdit}>
            <Edit3 className="w-4 h-4 mr-2" />
            {t('editText')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              {t('cancelText')}
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? t('savingText') : t('saveButtonText')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
