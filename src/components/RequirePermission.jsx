import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import api from "../config/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { getPermissionApiRoute, hasPermission } from "../lib/permissions";
import AcessoNegado from "../pages/AcessoNegado";
import LoadingIndicator from "./LoadingIndicator";

function DeniedRoute({ permission }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get(getPermissionApiRoute(permission))
      .catch(() => {})
      .finally(() => {
        if (active) setChecked(true);
      });

    return () => {
      active = false;
    };
  }, [permission]);

  if (!checked) return <LoadingIndicator label="Verificando acesso..." />;

  return <AcessoNegado />;
}

export default function RequirePermission({ permission }) {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingIndicator />;

  if (!profile || hasPermission(profile, permission)) return <Outlet />;

  return <DeniedRoute key={permission} permission={permission} />;
}
