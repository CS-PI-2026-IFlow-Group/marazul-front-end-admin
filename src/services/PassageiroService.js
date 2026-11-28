import api from "../config/axiosConfig";
import BaseService from "./BaseService";

class PassageiroService extends BaseService {
  constructor() {
    super("/api/passageiros");
  }

  async search(busca = "") {
    const response = await api.get(this.endpoint, {
      params: busca.trim() ? { busca: busca.trim() } : {},
    });
    return Array.isArray(response.data) ? response.data : [];
  }

  buildPayload(data) {
    const cpf = String(data.cpf ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const phone = String(data.phone ?? "").replace(/\D/g, "");

    return {
      name: data.name,
      cpf,
      phone: phone || null,
    };
  }

  async create(data) {
    return super.create(this.buildPayload(data));
  }

  async update(id, data) {
    return super.update(id, this.buildPayload(data));
  }
}

export default new PassageiroService();
