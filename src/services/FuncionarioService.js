import api from "../config/axiosConfig";
import BaseService from "./BaseService";

const FALLBACK_ENUMS = {
  positions: [
    { value: "DRIVER", label: "Motorista" },
    { value: "OTHER", label: "Outro" },
  ],
  roles: [
    { value: "USER", label: "Comum" },
    { value: "ADMIN", label: "Administrador (Admin)" },
  ],
  cnhCategories: [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "AB", label: "AB" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
    { value: "E", label: "E" },
  ],
};

class FuncionarioService extends BaseService {
  constructor() {
    super("/api/funcionario");
  }

  async getEnums() {
    try {
      const response = await api.get(`${this.endpoint}/enums`);
      const data = response.data || {};

      return {
        positions: data.positions || FALLBACK_ENUMS.positions,
        roles: data.roles || FALLBACK_ENUMS.roles,
        cnhCategories: data.cnhCategories || FALLBACK_ENUMS.cnhCategories,
      };
    } catch {
      return { ...FALLBACK_ENUMS };
    }
  }

  async inativar(id) {
    return this.delete(id);
  }
}

export default new FuncionarioService();
