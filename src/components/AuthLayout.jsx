import { cn } from "../lib/utils";
import { Card } from "./ui/card";

export default function AuthLayout({ children, className }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 text-foreground">
      <Card
        className={cn(
          "w-full max-w-100 gap-8 px-5 text-center ring-1 ring-foreground/5",
          className,
        )}
      >
        {children}
      </Card>
    </div>
  );
}
