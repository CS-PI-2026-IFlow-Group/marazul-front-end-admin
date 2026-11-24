import { LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";

export default function AuthSubmitButton({
  isLoading = false,
  isDisabled = false,
  loadingText = "Processando...",
  icon: Icon,
  children,
}) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={isDisabled || isLoading}
      className="mt-2 flex w-full text-xs tracking-widest uppercase"
    >
      {isLoading ? (
        <>
          {loadingText}
          <LoaderCircle className="animate-spin motion-reduce:animate-none" />
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon />}
        </>
      )}
    </Button>
  );
}
