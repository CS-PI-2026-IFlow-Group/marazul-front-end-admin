import logoMarazul from "../assets/logoMarazul.png";
import { CardDescription, CardTitle } from "./ui/card";

export default function AuthHeader() {
  return (
    <>
      <div className="flex flex-col items-center">
        <img
          src={logoMarazul}
          alt="Logo da Marazul"
          className="h-28 object-contain"
        />
      </div>
      <div className="-mt-2 space-y-1 text-center">
        <CardTitle className="font-display text-2xl leading-8 font-bold tracking-tight uppercase">
          Marazul
        </CardTitle>
        <CardDescription className="font-medium">
          Painel Administrativo
        </CardDescription>
      </div>
    </>
  );
}
