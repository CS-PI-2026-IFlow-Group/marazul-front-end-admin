import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export default function SubmitButton({
  isLoading,
  isDisabled,
  loadingText = "Processando...",
  children,
  icon: Icon,
}) {
  return (
    <Button
      type="submit"
      disabled={isDisabled || isLoading}
      className="w-full bg-[#062A45] hover:bg-[#0f172a] text-white h-12 font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer"
    >
      {isLoading ? (
        <>
          {loadingText} <Loader2 className="h-4 w-4 animate-spin" />
        </>
      ) : (
        <>
          {children} {Icon && <Icon className="h-4 w-4 font-bold" />}
        </>
      )}
    </Button>
  );
}
