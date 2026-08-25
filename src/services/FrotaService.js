import BaseService from './BaseService';
import api from '../config/axiosConfig';

/**
 * Enums locais usados como fallback caso o endpoint
 * GET /api/frota/enums esteja indisponível.
 *
 * Os valores devem corresponder exatamente aos nomes dos enums Java:
 *   - BodyworkModel: MARCOPOLO, COMIL, IRIZAR_BRASIL, BUSSCAR
 *   - VehicleType:   DD, LD, CONVENTIONAL
 *   - VehicleStatus: ACTIVE, INACTIVE, UNDER_MAINTENANCE
 */
const FALLBACK_ENUMS = {
  models: [
    { value: 'MARCOPOLO', label: 'Marcopolo' },
    { value: 'COMIL', label: 'Comil' },
    { value: 'IRIZAR_BRASIL', label: 'Irizar Brasil' },
    { value: 'BUSSCAR', label: 'Busscar' },
  ],
  types: [
    { value: 'DD', label: 'DD' },
    { value: 'LD', label: 'LD' },
    { value: 'CONVENTIONAL', label: 'Convencional' },
  ],
  statuses: [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'UNDER_MAINTENANCE', label: 'Em manutenção' },
  ],
};

class FrotaService extends BaseService {
  constructor() {
    super('/api/frota');
  }

  /**
   * Busca os enums de modelos, tipos e status do backend.
   * Retorna o objeto com as chaves: models, types, statuses.
   * Cada item possui { value, label }.
   */
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

  /**
   * Cadastra um novo veículo.
   * O payload é mapeado para os nomes de campo que o VehicleRequestDTO espera:
   *   prefix, licensePlate, model, type, year, seats, inspectionDate, status
   */
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
}

// Exporta uma instância única (singleton) para uso em toda a aplicação
export default new FrotaService();
