import api from "../config/axiosConfig";
import BaseService from "./BaseService";

class PerfilService extends BaseService {
  constructor() {
    super("/api/perfis");
  }

  /**
   * Lista as permissões disponíveis para vincular a um perfil
   * (GET /api/permissoes). Cada item: { id, rotaBase, funcionalidade }.
   */
  async getPermissoes() {
    const response = await api.get("/api/permissoes");
    const data = Array.isArray(response.data) ? response.data : [];

    return data.map(({ id, rotaBase, funcionalidade }) => ({
      id,
      rotaBase,
      funcionalidade,
    }));
  }

  // Padroniza o contrato de envio: { nome, permissionsIds }.
  buildPayload(data) {
    return {
      nome: String(data.nome ?? "").trim(),
      permissionsIds: (data.permissionsIds ?? [])
        .map(Number)
        .filter(Number.isFinite),
    };
  }

  async create(data) {
    return super.create(this.buildPayload(data));
  }

  async update(id, data) {
    return super.update(id, this.buildPayload(data));
  }
}

export default new PerfilService();
