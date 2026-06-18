import { Card } from "./ui/card";

export default function AuthLayout({ children, className = "" }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] p-4">
      <Card
        className={`w-full max-w-100 bg-white shadow-sm border-slate-200 py-6 px-2 ${className}`}
      >
        {children}
      </Card>
    </div>
  );
}
