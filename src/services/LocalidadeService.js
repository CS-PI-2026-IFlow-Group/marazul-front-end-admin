import api from "../config/axiosConfig";

class LocalidadeService {
  async getEstados() {
    const response = await api.get("/api/estados");
    return response.data;
  }

  async getCidades(estadoId, nome = "") {
    const response = await api.get("/api/cidades", {
      params: {
        estadoId: Number(estadoId),
        ...(nome.trim() ? { name: nome.trim() } : {}),
      },
    });
    return response.data;
  }

  async getCidadeById(id) {
    const response = await api.get(`/api/cidades/${id}`);
    return response.data;
  }
}

export default new LocalidadeService();
