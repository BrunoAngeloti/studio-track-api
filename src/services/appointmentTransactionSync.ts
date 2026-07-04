import { Appointment } from '../models/Appointment';
import { Transaction } from '../models/Transaction';
import { Service } from '../models/Service';
import { AdditionalService } from '../models/AdditionalService';
import { Category } from '../models/Category';
import { RepasseConfig } from '../models/RepasseConfig';

async function resolveAmount(appointment: Appointment, service: Service): Promise<number> {
  const withExtras = await Appointment.findByPk(appointment.id, {
    include: [{ model: AdditionalService, as: 'additional_services', through: { attributes: [] } }],
  });

  const additionalServices =
    ((withExtras as any)?.additional_services as AdditionalService[]) ?? [];

  const additionalTotal = additionalServices.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  return Number(service.price) + additionalTotal;
}

const DEFAULT_SERVICE_CATEGORY = { name: 'Serviços', color: '#22c55e' };

async function resolveServiceCategoryId(studio_id: string): Promise<number> {
  const existing = await Category.findOne({
    where: { studio_id, name: DEFAULT_SERVICE_CATEGORY.name },
  });

  if (existing) {
    return existing.id;
  }

  const created = await Category.create({
    studio_id,
    ...DEFAULT_SERVICE_CATEGORY,
  });

  return created.id;
}

async function resolveRepasse(studio_id: string, responsible_employee_id: number | null) {
  if (!responsible_employee_id) {
    return { repasse_employee_id: null, repasse_percentage: undefined };
  }

  const config = await RepasseConfig.findOne({
    where: { studio_id, responsible_employee_id },
    order: [['is_default', 'DESC']],
  });

  if (!config) {
    return { repasse_employee_id: null, repasse_percentage: undefined };
  }

  return {
    repasse_employee_id: config.repasse_employee_id,
    repasse_percentage: config.repasse_percentage ?? undefined,
  };
}

// Chamado sempre que um agendamento passa a ficar APPROVED (aprovação manual,
// criação já aprovada pelo gestor, update genérico de status, ou anexação/
// remoção de serviço adicional). Idempotente e recalculável: como
// appointment_id é único em transactions, uma transação PENDING existente
// tem seu valor recalculado (cobre serviços adicionais anexados depois da
// aprovação); uma já CONFIRMED/REJECTED nunca é mexida.
export async function createPendingTransactionForAppointment(appointment: Appointment) {
  if (appointment.status !== 'APPROVED') {
    return;
  }

  if (!appointment.service_id) {
    return;
  }

  const service = await Service.findByPk(appointment.service_id);

  if (!service) {
    return;
  }

  const amount = await resolveAmount(appointment, service);

  const existing = await Transaction.findOne({
    where: { appointment_id: appointment.id },
  });

  if (existing) {
    if (existing.status === 'PENDING' && Number(existing.amount) !== amount) {
      await existing.update({ amount });
    }

    return;
  }

  const category_id = await resolveServiceCategoryId(appointment.studio_id);
  const { repasse_employee_id, repasse_percentage } = await resolveRepasse(
    appointment.studio_id,
    appointment.responsible_employee_id ?? null
  );

  await Transaction.create({
    studio_id: appointment.studio_id,
    type: 'INCOME',
    status: 'PENDING',
    amount,
    date: new Date(appointment.scheduled_date),
    category_id,
    customer_id: appointment.customer_id ?? undefined,
    responsible_employee_id: appointment.responsible_employee_id ?? null,
    repasse_employee_id,
    repasse_percentage,
    appointment_id: appointment.id,
  });
}
