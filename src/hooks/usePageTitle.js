import { useEffect } from "react";
import { setDocumentTitle } from "../lib/title";

/**
 * Hook compartilhado para atualização do título da aba do navegador.
 *
 * @param {string} title Título específico da página a ser prefixado em " — Marazul Turismo"
 */
export function usePageTitle(title) {
  useEffect(() => {
    setDocumentTitle(title);
  }, [title]);
}

export default usePageTitle;

