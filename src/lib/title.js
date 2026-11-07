export const BASE_TITLE = "Painel Administrativo — Marazul Turismo";
export const TITLE_SUFFIX = " — Marazul Turismo";

/**
 * Formata o título da aba do painel no formato "<Página> — Marazul Turismo".
 * Caso nenhum título seja especificado, retorna o título base da aplicação.
 *
 * @param {string} [pageTitle] Título específico da página/seção
 * @returns {string} Título formatado para exibição na aba
 */
export function formatTitle(pageTitle) {
  if (!pageTitle || typeof pageTitle !== "string" || !pageTitle.trim()) {
    return BASE_TITLE;
  }

  const trimmed = pageTitle.trim();
  if (trimmed.endsWith(TITLE_SUFFIX)) {
    return trimmed;
  }

  return `${trimmed}${TITLE_SUFFIX}`;
}

/**
 * Único ponto de acesso para definição de document.title na aplicação.
 * Centraliza a formatação e impede a dispersão de document.title soltos.
 *
 * @param {string} [title] Título específico ou vazio para o título base
 */
export function setDocumentTitle(title) {
  if (typeof document !== "undefined") {
    document.title = formatTitle(title);
  }
}

