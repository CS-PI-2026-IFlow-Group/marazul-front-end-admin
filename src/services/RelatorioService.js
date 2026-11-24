import api from "../config/axiosConfig";
import { fileNameFromDisposition, saveFile } from "../lib/download";
import BaseService from "./BaseService";


class RelatorioService extends BaseService {
  constructor() {
    super("/api/relatorios");
  }

  async generate(relatorio, period = {}) {
    const response = await api.get(`${this.endpoint}/${relatorio}`, {
      params: periodParams(period),
    });
    return response.data;
  }

  async downloadPdf(relatorio, period = {}) {
    try {
      const response = await api.get(`${this.endpoint}/${relatorio}/pdf`, {
        params: periodParams(period),
        responseType: "blob",
      });
      const fileName =
        fileNameFromDisposition(response.headers["content-disposition"]) || `relatorio-${relatorio}.pdf`;
      saveFile(response.data, fileName);
      return fileName;
    } catch (error) {
      throw await withReadableBody(error);
    }
  }
}

function periodParams({ dataInicio, dataFim }) {
  return {
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  };
}

async function withReadableBody(error) {
  const data = error.response?.data;
  if (data instanceof Blob) {
    error.response.data = (await readJson(data)) ?? data;
  }
  return error;
}

async function readJson(blob) {
  try {
    return JSON.parse(await blob.text());
  } catch {
    return null;
  }
}

export default new RelatorioService();
