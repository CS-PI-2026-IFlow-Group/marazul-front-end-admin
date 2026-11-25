import api from "../config/axiosConfig";
import BaseService from "./BaseService";

// Além do timeout, evita que o skeleton fique girando indefinidamente caso o
// back-end aceite a conexão mas não responda.
const METRICS_TIMEOUT_MS = 10000;

function toCount(value) {
  return value === null || value === undefined ? null : Number(value);
}

class DashboardService extends BaseService {
  constructor() {
    super("/api/dashboard");
  }

  /**
   * Busca os contadores do painel (GET /api/dashboard/metricas).
   * Aceita um AbortSignal para que a tela cancele a requisição ao desmontar.
   */
  async getMetrics({ signal } = {}) {
    const response = await api.get(`${this.endpoint}/metricas`, {
      signal,
      timeout: METRICS_TIMEOUT_MS,
    });

    const data = response.data || {};

    return {
      totalVehicles: toCount(data.totalVehicles),
      activeEmployees: toCount(data.activeEmployees),
      totalClients: toCount(data.totalClients),
      totalPassengers: toCount(data.totalPassengers),
    };
  }
}

export default new DashboardService();
