import api from "../config/axiosConfig";

class FleetUsageReportService {
  async getUsoFrota(dataInicio, dataFim, { signal } = {}) {
    const response = await api.get("/api/relatorios/uso-frota", {
      params: { dataInicio, dataFim },
      signal,
    });

    return response.data;
  }
}

export default new FleetUsageReportService();