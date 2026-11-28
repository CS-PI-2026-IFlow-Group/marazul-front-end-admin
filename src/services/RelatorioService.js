import api from "../config/axiosConfig";
import { fileNameFromDisposition, saveFile } from "../lib/download";
import BaseService from "./BaseService";


class RelatorioService extends BaseService {
  constructor() {
    super("/api/relatorios");
  }

  async generate(relatorio, period = {}, filters = {}) {
    const response = await api.get(`${this.endpoint}/${relatorio}`, {
      params: { ...periodParams(period), ...filterParams(filters) },
    });
    return response.data;
  }

  async downloadPdf(relatorio, period = {}, filters = {}) {
    return downloadPdf(
      `${this.endpoint}/${relatorio}/pdf`,
      { ...periodParams(period), ...filterParams(filters) },
      `relatorio-${relatorio}.pdf`,
    );
  }

  async getTripResult(viagemId) {
    const response = await api.get(`${this.endpoint}/resultado-viagens/viagem/${viagemId}`);
    return response.data;
  }

  async downloadTripResultPdf(viagemId) {
    return downloadPdf(
      `${this.endpoint}/resultado-viagens/viagem/${viagemId}/pdf`,
      {},
      `resultado-viagem-${viagemId}.pdf`,
    );
  }
}

async function downloadPdf(url, params, fallbackName) {
  try {
    const response = await api.get(url, { params, responseType: "blob" });
    const fileName = fileNameFromDisposition(response.headers["content-disposition"]) || fallbackName;
    saveFile(response.data, fileName);
    return fileName;
  } catch (error) {
    throw await withReadableBody(error);
  }
}

function periodParams({ dataInicio, dataFim }) {
  return {
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  };
}

function filterParams(filters) {
  return Object.fromEntries(
    Object.entries(filters ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
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
