import api from "../config/axiosConfig";
import { onlyDigits } from "../lib/documentMasks";
import BaseService from "./BaseService";

class ClienteService extends BaseService {
  constructor() {
    super("/api/clientes");
  }

  async getAll(busca = "") {
    const response = await api.get(this.endpoint, {
      params: busca.trim() ? { busca: busca.trim() } : {},
    });
    return response.data;
  }

  buildPayload(data) {
    const cpf = onlyDigits(data.cpf);
    const cnpj = onlyDigits(data.cnpj);
    const cityId = Number(data.address?.cityId);

    if (!Number.isInteger(cityId) || cityId <= 0) {
      throw new Error("Selecione uma cidade válida.");
    }

    return {
      name: data.name?.trim() ?? "",
      cpf: cpf || null,
      cnpj: cnpj || null,
      address: {
        street: data.address?.street?.trim() ?? "",
        number: data.address?.number?.trim() ?? "",
        complement: data.address?.complement?.trim() || null,
        cityId,
      },
    };
  }

  async create(data) {
    return super.create(this.buildPayload(data));
  }

  async update(id, data) {
    return super.update(id, this.buildPayload(data));
  }
}

export default new ClienteService();
