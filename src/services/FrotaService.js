import api from "../config/axiosConfig";
import BaseService from "./BaseService";

export const FALLBACK_ENUMS = {
  models: [
    { value: "MARCOPOLO", label: "Marcopolo" },
    { value: "COMIL", label: "Comil" },
    { value: "IRIZAR_BRASIL", label: "Irizar Brasil" },
    { value: "BUSSCAR", label: "Busscar" },
  ],
  types: [
    { value: "DD", label: "DD" },
    { value: "LD", label: "LD" },
    { value: "CONVENTIONAL", label: "Convencional" },
  ],
  statuses: [
    { value: "ACTIVE", label: "Ativo" },
    { value: "INACTIVE", label: "Inativo" },
    { value: "UNDER_MAINTENANCE", label: "Em manutenção" },
  ],
};

class FrotaService extends BaseService {
  constructor() {
    super("/api/frota");
  }

  async getEnums() {
    try {
      const response = await api.get(`${this.endpoint}/enums`);
      const data = response.data || {};

      return {
        models: data.models || FALLBACK_ENUMS.models,
        types: data.types || FALLBACK_ENUMS.types,
        statuses: data.statuses || FALLBACK_ENUMS.statuses,
      };
    } catch {
      return { ...FALLBACK_ENUMS };
    }
  }

  async create(data) {
    const payload = {
      prefix: data.prefix,
      licensePlate: data.licensePlate,
      model: data.model,
      type: data.type,
      year: Number(data.year),
      seats: Number(data.seats),
      inspectionDate: data.inspectionDate || null,
      status: data.status,
    };
    return super.create(payload);
  }

  async changeStatus(id, newStatus) {
    const vehicle = await this.getById(id);
    const payload = {
      prefix: vehicle.prefix,
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
      type: vehicle.type,
      year: vehicle.year,
      seats: vehicle.seats,
      inspectionDate: vehicle.inspectionDate || null,
      status: newStatus,
    };
    return this.update(id, payload);
  }

  async inactivate(id) {
    return this.changeStatus(id, 'INACTIVE');
  }

  async activate(id) {
    return this.changeStatus(id, 'ACTIVE');
  }

  getLabel(enumKey, value) {
    const item = FALLBACK_ENUMS[enumKey]?.find((e) => e.value === value);
    return item?.label || value;
  }
}

export default new FrotaService();
