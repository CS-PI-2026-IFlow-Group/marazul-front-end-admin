import api from "../config/axiosConfig";
import { fileNameFromDisposition, saveFile } from "../lib/download";

const ENDPOINT = "/api/relatorios/resumo-mensal";

class ResumoMensalService {
  async getResumo(mes, { signal } = {}) {
    const response = await api.get(ENDPOINT, { params: { mes }, signal });
    return response.data;
  }

  async downloadPdf(mes) {
    try {
      const response = await api.get(`${ENDPOINT}/pdf`, {
        params: { mes },
        responseType: "blob",
      });
      const fileName = fileNameFromDisposition(response.headers["content-disposition"])
        || `resumo-mensal-${mes}.pdf`;
      saveFile(response.data, fileName);
      return fileName;
    } catch (error) {
      const body = error.response?.data;
      if (body instanceof Blob) {
        try {
          error.response.data = JSON.parse(await body.text());
        } catch {
          // Keep the original response body when it is not a JSON error.
        }
      }
      throw error;
    }
  }
}

export default new ResumoMensalService();
