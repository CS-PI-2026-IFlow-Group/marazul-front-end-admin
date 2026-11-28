import api from "../config/axiosConfig";
import { toApiDateTime } from "../lib/dateTime";
import BaseService from "./BaseService";

export const FALLBACK_STATUSES = [
  { value: "SCHEDULED", label: "Agendada" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "LEFT_ORIGIN", label: "Saiu da origem" },
  { value: "ARRIVED_DESTINATION", label: "Chegou ao destino" },
  { value: "LEFT_DESTINATION", label: "Saiu do destino" },
  { value: "ARRIVED_ORIGIN", label: "Chegou à origem" },
  { value: "COMPLETED", label: "Concluída" },
];

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function toExpensesPayload(expenses) {
  return (expenses ?? []).map((expense) => ({
    description: expense.description.trim(),
    amount: toNumberOrNull(expense.amount),
  }));
}

class ViagemService extends BaseService {
  constructor() {
    super("/api/viagens");
  }

  async getAll(filters = {}) {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.dataInicio) params.dataInicio = filters.dataInicio;
    if (filters.dataFim) params.dataFim = filters.dataFim;

    const response = await api.get(this.endpoint, { params });
    return response.data;
  }

  async getEnums() {
    try {
      const response = await api.get(`${this.endpoint}/enums`);
      const statuses = Array.isArray(response.data) ? response.data : [];
      return { statuses: statuses.length > 0 ? statuses : FALLBACK_STATUSES };
    } catch {
      return { statuses: FALLBACK_STATUSES };
    }
  }

  buildPayload(data) {
    return {
      originCityId: toNumberOrNull(data.originCityId),
      destinationCityId: toNumberOrNull(data.destinationCityId),
      plannedDepartureOrigin: toApiDateTime(data.plannedDepartureOrigin),
      plannedArrivalDestination: toApiDateTime(data.plannedArrivalDestination),
      plannedDepartureDestination: toApiDateTime(data.plannedDepartureDestination),
      plannedArrivalOrigin: toApiDateTime(data.plannedArrivalOrigin),
      vehicleId: toNumberOrNull(data.vehicleId),
      driverIds: (data.driverIds ?? []).map(Number),
      clientId: toNumberOrNull(data.clientId),
      minimumPassengers: toNumberOrNull(data.minimumPassengers),
      estimatedPassengerAmount: toNumberOrNull(data.estimatedPassengerAmount),
      estimatedTotalValue: toNumberOrNull(data.estimatedTotalValue),
      estimatedIndividualValue: toNumberOrNull(data.estimatedIndividualValue),
      expenses: toExpensesPayload(data.expenses),
      notes: data.notes?.trim() || null,
      responsiblePassengerId: toNumberOrNull(data.responsiblePassengerId),
      passengers: Array.isArray(data.passengers)
        ? data.passengers.map((passenger) => ({
            passengerId: Number(passenger.passengerId),
            amountDue: toNumberOrNull(passenger.amountDue),
            amountPaid: toNumberOrNull(passenger.amountPaid) ?? 0,
          }))
        : undefined,
    };
  }

  async create(data) {
    return super.create(this.buildPayload(data));
  }

  async update(id, data) {
    return super.update(id, this.buildPayload(data));
  }

  async updateExpenses(id, expenses) {
    const response = await api.put(`${this.endpoint}/${id}/gastos`, {
      expenses: toExpensesPayload(expenses),
    });
    return response.data;
  }

  async alterarSituacao(id, status, dataHora = null) {
    const response = await api.patch(`${this.endpoint}/${id}/situacao`, {
      status,
      dataHora: toApiDateTime(dataHora),
    });
    return response.data;
  }

  getStatusLabel(value) {
    const item = FALLBACK_STATUSES.find((status) => status.value === value);
    return item?.label || value;
  }
}

export default new ViagemService();
