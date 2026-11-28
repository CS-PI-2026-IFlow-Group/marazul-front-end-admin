import { ArrowLeft, Save } from "lucide-react";
import LoadingIndicator from "./LoadingIndicator";
import { Button } from "./ui/button";

export default function FormFooter({
  formId,
  onBack,
  isSaving = false,
  isDisabled = false,
  saveLabel,
  showSave = true,
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="w-full sm:w-auto"
      >
        <ArrowLeft /> Voltar
      </Button>
      {showSave && (
        <Button
          type="submit"
          form={formId}
          disabled={isDisabled || isSaving}
          className="w-full px-5 sm:w-auto"
        >
          {isSaving ? (
            <LoadingIndicator variant="button" label="Salvando..." />
          ) : (
            <>
              <Save /> {saveLabel}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
