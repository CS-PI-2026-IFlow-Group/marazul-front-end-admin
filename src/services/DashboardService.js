import api from "../config/axiosConfig";
import BaseService from "./BaseService";

// Além do timeout, evita que o skeleton fique girando indefinidamente caso o
// back-end aceite a conexão mas não responda.
const METRICS_TIMEOUT_MS = 10000;

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
      totalVehicles: Number(data.totalVehicles ?? 0),
      activeEmployees: Number(data.activeEmployees ?? 0),
    };
  }
}

export default new DashboardService();
