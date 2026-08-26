import api from '../config/axiosConfig';

/**
 * Serviço base com métodos CRUD genéricos.
 * Todas as requisições passam pela instância centralizada do axios (token automático).
 */
export default class BaseService {
    /**
     * @param {string} endpoint — caminho da API, ex: '/api/frota'
     */
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async create(data) {
        const response = await api.post(this.endpoint, data);
        return response.data;
    }

    async getAll() {
        const response = await api.get(this.endpoint);
        return response.data;
    }

    async getById(id) {
        const response = await api.get(`${this.endpoint}/${id}`);
        return response.data;
    }

    async update(id, data) {
        const response = await api.put(`${this.endpoint}/${id}`, data);
        return response.data;
    }

    async delete(id) {
        const response = await api.delete(`${this.endpoint}/${id}`);
        return response.data;
    }
}
