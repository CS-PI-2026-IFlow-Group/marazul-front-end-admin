import { Search } from "lucide-react";
import { cn } from "../lib/utils";
import { Card } from "./ui/card";

export default function ListCard({
  title,
  count,
  search,
  toolbar,
  className,
  children,
}) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {count !== undefined && count !== null && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {count}
            </span>
          )}
        </div>
        {(search || toolbar) && (
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {search && (
              <label className="flex w-full items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm sm:w-72">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  id={search.id}
                  aria-label={search.label}
                  placeholder={search.placeholder}
                  value={search.value}
                  onChange={search.onChange}
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </label>
            )}
            {toolbar}
          </div>
        )}
      </div>
      {children}
    </Card>
  );
}
