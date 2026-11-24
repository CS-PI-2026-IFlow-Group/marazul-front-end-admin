import { cn } from "../lib/utils";

export default function DataTable({ head, children, className }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left text-[11px] tracking-wider text-muted-foreground uppercase">
            {head.map((column, index) => (
              <th
                key={column || index}
                scope="col"
                className="px-6 py-3 font-semibold"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y [&_td]:px-6 [&_td]:py-4 [&_tr:hover]:bg-muted/40">
          {children}
        </tbody>
      </table>
    </div>
  );
}
