import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { WeeklyAvailability } from '../models/WeeklyAvailability';
import { AvailabilityOverride } from '../models/AvailabilityOverride';
import { Appointment } from '../models/Appointment';
import { Customer } from '../models/Customer';

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

function getStudioIdFromRequest(req: Request) {
  return (req as any).user?.studio_id as string | undefined;
}

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const {
      studio_id,
      customer_id,
      service_id,
      responsible_employee_id,
      scheduled_date,
      scheduled_time,
      requester_name,
      requester_phone,
      note,
    } = req.body;

    if (
      !studio_id ||
      !scheduled_date ||
      !scheduled_time ||
      !requester_name ||
      !requester_phone
    ) {
      return res.status(400).json({
        message:
          'studio_id, scheduled_date, scheduled_time, requester_name and requester_phone are required',
      });
    }

    const requester_phone_normalized = normalizePhone(requester_phone);

    let resolvedCustomerId: number | null = customer_id ?? null;

    if (!resolvedCustomerId) {
      const customer = await Customer.findOne({
        where: {
          studio_id,
          // ajuste aqui se no seu model o nome for phone_normalized
          normalized_phone: requester_phone_normalized,
        } as any,
      });

      if (customer) {
        resolvedCustomerId = customer.id;
      }
    }

    const existingAppointment = await Appointment.findOne({
      where: {
        studio_id,
        scheduled_date,
        scheduled_time,
        status: {
          [Op.in]: ['PENDING', 'APPROVED'],
        },
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: 'This time slot is no longer available',
      });
    }

    const appointment = await Appointment.create({
      studio_id,
      customer_id: resolvedCustomerId,
      service_id: service_id ?? null,
      responsible_employee_id: responsible_employee_id ?? null,
      scheduled_date,
      scheduled_time,
      requester_name,
      requester_phone,
      requester_phone_normalized,
      status: 'PENDING',
      note: note ?? null,
      expires_at: null,
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error('createAppointment error:', error);
    return res.status(500).json({
      message: 'Error creating appointment',
    });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const studio_id = getStudioIdFromRequest(req);

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const {
      page = '1',
      limit = '10',
      status,
      scheduled_date,
      customer_id,
      service_id,
      responsible_employee_id,
      search,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);
    const offset = (pageNumber - 1) * limitNumber;

    const where: any = {
      studio_id,
    };

    if (typeof status === 'string' && status.trim()) {
      where.status = status;
    }

    if (typeof scheduled_date === 'string' && scheduled_date.trim()) {
      where.scheduled_date = scheduled_date;
    }

    if (typeof customer_id === 'string' && customer_id.trim()) {
      where.customer_id = Number(customer_id);
    }

    if (typeof service_id === 'string' && service_id.trim()) {
      where.service_id = Number(service_id);
    }

    if (
      typeof responsible_employee_id === 'string' &&
      responsible_employee_id.trim()
    ) {
      where.responsible_employee_id = Number(responsible_employee_id);
    }

    if (typeof search === 'string' && search.trim()) {
      const normalized = normalizePhone(search);

      where[Op.or] = [
        { requester_name: { [Op.iLike]: `%${search}%` } },
        { requester_phone: { [Op.iLike]: `%${search}%` } },
        { requester_phone_normalized: { [Op.like]: `%${normalized}%` } },
      ];
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          required: false,
        },
      ],
      order: [
        ['scheduled_date', 'DESC'],
        ['scheduled_time', 'ASC'],
        ['created_at', 'DESC'],
      ],
      limit: limitNumber,
      offset,
    });

    return res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        page: pageNumber,
        limit: limitNumber,
        total_pages: Math.ceil(count / limitNumber),
      },
    });
  } catch (error) {
    console.error('getAppointments error:', error);
    return res.status(500).json({
      message: 'Error fetching appointments',
    });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const studio_id = getStudioIdFromRequest(req);

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    const appointment = await Appointment.findOne({
      where: {
        id: Number(id),
        studio_id,
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          required: false,
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
      });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error('getAppointmentById error:', error);
    return res.status(500).json({
      message: 'Error fetching appointment',
    });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const studio_id = getStudioIdFromRequest(req);

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;
    const {
      customer_id,
      service_id,
      responsible_employee_id,
      scheduled_date,
      scheduled_time,
      requester_name,
      requester_phone,
      note,
      status,
    } = req.body;

    const appointment = await Appointment.findOne({
      where: {
        id: Number(id),
        studio_id,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
      });
    }

    if (scheduled_date || scheduled_time) {
      const nextDate = scheduled_date ?? appointment.scheduled_date;
      const nextTime = scheduled_time ?? appointment.scheduled_time;

      const conflictingAppointment = await Appointment.findOne({
        where: {
          id: { [Op.ne]: appointment.id },
          studio_id,
          scheduled_date: nextDate,
          scheduled_time: nextTime,
          status: {
            [Op.in]: ['PENDING', 'APPROVED'],
          },
        },
      });

      if (conflictingAppointment) {
        return res.status(409).json({
          message: 'This time slot is no longer available',
        });
      }
    }

    let requester_phone_normalized = appointment.requester_phone_normalized;
    if (requester_phone) {
      requester_phone_normalized = normalizePhone(requester_phone);
    }

    await appointment.update({
      customer_id:
        customer_id !== undefined ? customer_id : appointment.customer_id,
      service_id: service_id !== undefined ? service_id : appointment.service_id,
      responsible_employee_id:
        responsible_employee_id !== undefined
          ? responsible_employee_id
          : appointment.responsible_employee_id,
      scheduled_date: scheduled_date ?? appointment.scheduled_date,
      scheduled_time: scheduled_time ?? appointment.scheduled_time,
      requester_name: requester_name ?? appointment.requester_name,
      requester_phone: requester_phone ?? appointment.requester_phone,
      requester_phone_normalized,
      note: note !== undefined ? note : appointment.note,
      status: status ?? appointment.status,
    });

    return res.status(200).json(appointment);
  } catch (error) {
    console.error('updateAppointment error:', error);
    return res.status(500).json({
      message: 'Error updating appointment',
    });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const studio_id = getStudioIdFromRequest(req);

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    const appointment = await Appointment.findOne({
      where: {
        id: Number(id),
        studio_id,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
      });
    }

    await appointment.destroy();

    return res.status(200).json({
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('deleteAppointment error:', error);
    return res.status(500).json({
      message: 'Error deleting appointment',
    });
  }
};

export const approveAppointment = async (req: Request, res: Response) => {
  try {
    const studio_id = getStudioIdFromRequest(req);

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    const appointment = await Appointment.findOne({
      where: {
        id: Number(id),
        studio_id,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'APPROVED') {
      return res.status(400).json({
        message: 'Appointment is already approved',
      });
    }

    if (
      appointment.status === 'REJECTED' ||
      appointment.status === 'CANCELLED' ||
      appointment.status === 'EXPIRED'
    ) {
      return res.status(400).json({
        message: `Cannot approve an appointment with status ${appointment.status}`,
      });
    }

    const conflictingAppointment = await Appointment.findOne({
      where: {
        id: { [Op.ne]: appointment.id },
        studio_id,
        scheduled_date: appointment.scheduled_date,
        scheduled_time: appointment.scheduled_time,
        status: {
          [Op.in]: ['APPROVED', 'PENDING'],
        },
      },
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        message: 'There is already another appointment occupying this slot',
      });
    }

    let resolvedCustomerId = appointment.customer_id ?? null;

    if (!resolvedCustomerId) {
      let customer = await Customer.findOne({
        where: {
          studio_id,
          // ajuste aqui se no seu model o nome for phone_normalized
          normalized_phone: appointment.requester_phone_normalized,
        } as any,
      });

      if (!customer) {
        customer = await Customer.create({
          studio_id,
          name: appointment.requester_name,
          phone: appointment.requester_phone,
          // ajuste aqui se no seu model o nome for phone_normalized
          normalized_phone: appointment.requester_phone_normalized,
        } as any);
      }

      resolvedCustomerId = customer.id;
    }

    await appointment.update({
      customer_id: resolvedCustomerId,
      status: 'APPROVED',
      approved_at: new Date(),
      rejected_at: null,
      rejection_reason: null,
    });

    return res.status(200).json(appointment);
  } catch (error) {
    console.error('approveAppointment error:', error);
    return res.status(500).json({
      message: 'Error approving appointment',
    });
  }
};

export const rejectAppointment = async (req: Request, res: Response) => {
  try {
    const studio_id = getStudioIdFromRequest(req);

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;
    const { rejection_reason } = req.body;

    const appointment = await Appointment.findOne({
      where: {
        id: Number(id),
        studio_id,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'REJECTED') {
      return res.status(400).json({
        message: 'Appointment is already rejected',
      });
    }

    if (
      appointment.status === 'APPROVED' ||
      appointment.status === 'CANCELLED' ||
      appointment.status === 'EXPIRED'
    ) {
      return res.status(400).json({
        message: `Cannot reject an appointment with status ${appointment.status}`,
      });
    }

    await appointment.update({
      status: 'REJECTED',
      rejected_at: new Date(),
      rejection_reason: rejection_reason ?? null,
    });

    return res.status(200).json(appointment);
  } catch (error) {
    console.error('rejectAppointment error:', error);
    return res.status(500).json({
      message: 'Error rejecting appointment',
    });
  }
};

export const getPublicAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { studio_id, date } = req.query;

    if (!studio_id || !date) {
      return res.status(400).json({
        message: 'studio_id and date are required',
      });
    }

    const selectedDate = new Date(String(date));

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid date',
      });
    }

    const weekday = selectedDate.getDay(); // 0=domingo ... 6=sábado

    const weeklySlots = await WeeklyAvailability.findAll({
      where: {
        studio_id: String(studio_id),
        weekday,
        is_active: true,
      },
      attributes: ['time'],
      order: [['time', 'ASC']],
    });

    const overrides = await AvailabilityOverride.findAll({
      where: {
        studio_id: String(studio_id),
        date: String(date),
      },
      attributes: ['type', 'time'],
    });

    const blockedDay = overrides.some(
      (override) => override.type === 'BLOCK_DAY'
    );

    if (blockedDay) {
      return res.status(200).json({
        date,
        available_slots: [],
      });
    }

    let slots = weeklySlots.map((slot) => slot.time);

    const addTimes = overrides
      .filter((override) => override.type === 'ADD' && override.time)
      .map((override) => override.time as string);

    const removeTimes = overrides
      .filter((override) => override.type === 'REMOVE' && override.time)
      .map((override) => override.time as string);

    slots = [...slots, ...addTimes];

    slots = slots.filter((time, index, arr) => arr.indexOf(time) === index);

    slots = slots.filter((time) => !removeTimes.includes(time));

    const bookedAppointments = await Appointment.findAll({
      where: {
        studio_id: String(studio_id),
        scheduled_date: String(date),
        status: {
          [Op.in]: ['PENDING', 'APPROVED'],
        },
      },
      attributes: ['scheduled_time'],
    });

    const bookedTimes = bookedAppointments.map(
      (appointment) => appointment.scheduled_time
    );

    const availableSlots = slots
      .filter((time) => !bookedTimes.includes(time))
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      date,
      available_slots: availableSlots,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error fetching available slots',
    });
  }
};

export const getMonthlyAvailability = async (req: Request, res: Response) => {
  try {
    const { studio_id, month } = req.query;

    if (!studio_id || !month) {
      return res.status(400).json({
        message: 'studio_id and month are required',
      });
    }

    if (typeof studio_id !== 'string' || typeof month !== 'string') {
      return res.status(400).json({
        message: 'studio_id and month must be strings',
      });
    }

    const [year, monthNumber] = month.split('-').map(Number);

    if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({
        message: 'month must be in YYYY-MM format',
      });
    }

    const daysInMonth = new Date(year, monthNumber, 0).getDate();

    const result = await Promise.all(
      Array.from({ length: daysInMonth }, async (_, index) => {
        const day = index + 1;
        const date = new Date(year, monthNumber - 1, day);
        const formattedDate = date.toISOString().split('T')[0];
        const weekday = date.getDay();

        // Busca TODOS os horários semanais ativos daquele dia da semana
        const weeklyAvailabilities = await WeeklyAvailability.findAll({
          where: {
            studio_id,
            weekday,
            is_active: true,
          },
        });

        const overrides = await AvailabilityOverride.findAll({
          where: {
            studio_id,
            date: formattedDate,
          },
        });

        const hasBlockDay = overrides.some(
          (override) => override.type === 'BLOCK_DAY'
        );

        // Se tiver BLOCK_DAY, a base semanal zera
        let availableTimes = hasBlockDay
          ? []
          : weeklyAvailabilities.map((item) => item.time); 

        const removeTimes = overrides
          .filter((override) => override.type === 'REMOVE' && override.time)
          .map((override) => override.time);

        const addTimes = overrides
          .filter(
            (override): override is typeof override & { time: string } =>
              override.type === 'ADD' && !!override.time
          )
          .map((override) => override.time);

        // Remove horários bloqueados pontualmente
        availableTimes = availableTimes.filter(
          (time) => !removeTimes.includes(time)
        );

        // Adiciona horários extras
        availableTimes = [...availableTimes, ...addTimes];

        // Remove duplicados
        const uniqueAvailableTimes = [...new Set(availableTimes)];

        return {
          date: formattedDate,
          has_availability: uniqueAvailableTimes.length > 0,
          times: uniqueAvailableTimes,
        };
      })
    );

    return res.json({
      month,
      days: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Error fetching monthly availability',
    });
  }
};