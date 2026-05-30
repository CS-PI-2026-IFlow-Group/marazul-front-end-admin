import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mail } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <Card className="w-full max-w-md bg-white shadow-sm border-slate-200 py-6 px-2">
        <CardHeader className="flex flex-col items-center space-y-6 pb-8">
          <div className="flex flec-col items-center gap-1.5 transform -rotate-6">
            {/* logo */}
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
              Marazul
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 font-medium">
              Painel Administrativo
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[11px] font-bold text-slate-700 tracking-wider"
            >
              EMAIL
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="nome@marazul.com.br"
                className="pl-9 bg-[#F8FAFC] border-slate-200 h-11 text-sm focus-visible:ring-slate-300"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
