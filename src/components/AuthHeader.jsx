import logoMarazul from "../assets/logoMarazul.png";
import { CardTitle, CardDescription } from "./ui/card";

export default function AuthHeader() {
  return (
    <>
      <div className="flex flex-col items-center transform">
        <img
          src={logoMarazul}
          alt="Logo da Marazul"
          className="h-32 object-contain"
        />
      </div>
      <div className="text-center space-y-1 -mt-4">
        <CardTitle className="text-2xl font-bold text-[#062A45] tracking-tight">
          Marazul
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 font-medium">
          Painel Administrativo
        </CardDescription>
      </div>
    </>
  );
}
