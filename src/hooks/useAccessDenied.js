import { useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import {
  clearAccessDenied,
  getAccessDenied,
  subscribeAccessDenied,
} from "../lib/accessDenied";

export function useAccessDenied() {
  const { pathname } = useLocation();
  const denial = useSyncExternalStore(subscribeAccessDenied, getAccessDenied);

  useEffect(() => {
    clearAccessDenied();
  }, [pathname]);

  return denial?.pathname === pathname ? denial : null;
}

export default useAccessDenied;
