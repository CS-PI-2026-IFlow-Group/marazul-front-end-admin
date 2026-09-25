import api from "../config/axiosConfig";
import BaseService from "./BaseService";

const FALLBACK_ENUMS = {
  positions: [
    { value: "DRIVER", label: "Motorista" },
    { value: "OTHER", label: "Outros" },
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

  async create(data) {
    return super.create({
      ...data,
      status: data.status || "ACTIVE",
    });
  }

  async getEnums() {
    try {
      const response = await api.get(`${this.endpoint}/enums`);
      const data = response.data || {};

      return {
        positions: data.positions || FALLBACK_ENUMS.positions,
        cnhCategories:
          data.cnhCategories || data.cnhTypes || FALLBACK_ENUMS.cnhCategories,
      };
    } catch {
      return { ...FALLBACK_ENUMS };
    }
  }

  async changeStatus(id, status) {
    const funcionario = await this.getById(id);
    return this.update(id, {
      name: funcionario.name,
      admissionDate: funcionario.admissionDate || "",
      cellphoneNumber: funcionario.cellphoneNumber || "",
      position: funcionario.position,
      isUser: funcionario.isUser === true,
      ...(funcionario.position === "DRIVER" && {
        cnhNumber: funcionario.cnhNumber || "",
        cnhType: funcionario.cnhType || "",
      }),
      ...(funcionario.email && { email: funcionario.email }),
      status,
    });
  }

  async inativar(id) {
    return this.changeStatus(id, "INACTIVE");
  }

  async ativar(id) {
    return this.changeStatus(id, "ACTIVE");
  }

  getLabel(enumKey, value) {
    const item = FALLBACK_ENUMS[enumKey]?.find((e) => e.value === value);
    return item?.label || value || "—";
  }
}

export default new FuncionarioService();
