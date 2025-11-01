import { Button } from "@/components/ui/button";
import { User, Save } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ProfileSettingsHeaderProps {
  isEditing: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const ProfileSettingsHeader = ({ 
  isEditing, 
  hasChanges, 
  onEdit, 
  onCancel, 
  onSave 
}: ProfileSettingsHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <User className="w-6 h-6 text-pink-500" />
          {t("profileSettingsTitle")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">{t("profileSettingsDesc")}</p>
      </div>
      
      <div className="flex gap-2">
        {!isEditing ? (
          <Button onClick={onEdit} className="bg-pink-500 hover:bg-pink-600 text-white">
            {t("editButton")}
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onCancel} className="dark:border-gray-600/50 dark:text-gray-200 dark:hover:bg-gray-700/50">
              {t("cancelButton")}
            </Button>
            <Button 
              onClick={onSave}
              disabled={!hasChanges}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Save className="w-4 h-4 mr-2 text-white" />
              {t("saveButton")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
