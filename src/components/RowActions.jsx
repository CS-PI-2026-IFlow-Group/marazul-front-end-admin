export default function RowActions({ children }) {
  return (
    <div className="flex items-center gap-1 [&_button]:cursor-pointer [&_button]:rounded-md [&_button]:p-1.5 [&_button]:text-muted-foreground [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-30 [&_button:disabled:hover]:bg-transparent [&_button:disabled:hover]:text-muted-foreground [&_button:hover]:bg-muted [&_button:hover]:text-foreground">
      {children}
    </div>
  );
}
