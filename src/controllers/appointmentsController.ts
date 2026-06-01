import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import { WeeklyAvailability } from '../models/WeeklyAvailability';
import { AvailabilityOverride } from '../models/AvailabilityOverride';
import { Appointment } from '../models/Appointment';
import { Customer } from '../models/Customer';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Service } from '../models/Service';
import { AdditionalService } from '../models/AdditionalService';
import { Studio } from '../models/Studio';
import { sendAppointmentNotificationEmail } from '../services/emailService';

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const {
      studio_id,
      customer_id,
      status,
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

    const requester_phone_normalized = normalizePhone(requester_phone);

    let resolvedCustomerId: number | null = customer_id ?? null;

    if (!resolvedCustomerId) {
      let customer = await Customer.findOne({
        where: {
          studio_id,
          [Op.and]: Sequelize.where(
            Sequelize.fn(
              'regexp_replace',
              Sequelize.col('phone'),
              '\\D',
              '',
              'g'
            ),
            requester_phone_normalized
          ),
        },
      });

      if (!customer) {
        customer = await Customer.create({
          studio_id,
          name: requester_name,
          phone: requester_phone,
          archived: false,
        });
      }

      resolvedCustomerId = customer.id;
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
      status: status ?? 'PENDING',
      note: note ?? null,
      expires_at: null,
    });

    // Send email notification if appointment is pending
    const appointmentStatus = status ?? 'PENDING';
    if (appointmentStatus === 'PENDING') {
      try {
        const studio = await Studio.findByPk(studio_id);
        const customer = resolvedCustomerId
          ? await Customer.findByPk(resolvedCustomerId)
          : null;
        const appointmentService = service_id
          ? await Service.findByPk(service_id)
          : null;

        if (studio) {
          await sendAppointmentNotificationEmail({
            appointment,
            studio,
            customer,
            service: appointmentService,
          });
        }
      } catch (emailError) {
        // Email sending failed, but appointment was created successfully
        // This is logged in the emailService, no need to re-log here
      }
    }

    return res.status(201).json(appointment);
  } catch (error) {
    console.error('createAppointment error:', error);
    return res.status(500).json({
      message: 'Error creating appointment',
    });
  }
};

export const getAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studio_id = req.studio?.id;

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
        {
          model: Service,
          as: 'service',
          required: false,
        },
        {
          model: AdditionalService,
          as: 'additional_services',
          through: { attributes: [] },
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
      distinct: true,
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

export const getAppointmentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studio_id = req.studio?.id;

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

export const updateAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studio_id = req.studio?.id;

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

export const deleteAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studio_id = req.studio?.id;

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

export const approveAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studio_id = req.studio?.id;

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
          [Op.and]: Sequelize.where(
            Sequelize.fn(
              'regexp_replace',
              Sequelize.col('phone'),
              '\\D',
              '',
              'g'
            ),
            appointment.requester_phone_normalized
          ),
        },
      });

      if (!customer) {
        customer = await Customer.create({
          studio_id,
          name: appointment.requester_name,
          phone: appointment.requester_phone,
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

export const rejectAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studio_id = req.studio?.id;

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

    const monthDates = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = new Date(year, monthNumber - 1, day);
      const formattedDate = date.toISOString().split('T')[0];
      const weekday = date.getDay();

      return {
        day,
        date,
        formattedDate,
        weekday,
      };
    });

    const startDate = `${month}-01`;
    const endDate = `${month}-${String(daysInMonth).padStart(2, '0')}`;

    const [weeklyAvailabilities, overrides, bookedAppointments] =
      await Promise.all([
        WeeklyAvailability.findAll({
          where: {
            studio_id,
            is_active: true,
          },
          attributes: ['weekday', 'time'],
          order: [['time', 'ASC']],
        }),

        AvailabilityOverride.findAll({
          where: {
            studio_id,
            date: {
              [Op.between]: [startDate, endDate],
            },
          },
          attributes: ['date', 'type', 'time'],
        }),

        Appointment.findAll({
          where: {
            studio_id,
            scheduled_date: {
              [Op.between]: [startDate, endDate],
            },
            status: {
              [Op.in]: ['PENDING', 'APPROVED'],
            },
          },
          attributes: ['scheduled_date', 'scheduled_time'],
        }),
      ]);

    const weeklyMap = new Map<number, string[]>();
    for (const item of weeklyAvailabilities) {
      const weekday = item.weekday;
      const time = item.time;

      if (!weeklyMap.has(weekday)) {
        weeklyMap.set(weekday, []);
      }

      weeklyMap.get(weekday)!.push(time);
    }

    const overridesMap = new Map<string, typeof overrides>();
    for (const override of overrides) {
      const date = override.date;

      if (!overridesMap.has(date)) {
        overridesMap.set(date, []);
      }

      overridesMap.get(date)!.push(override);
    }

    const bookedMap = new Map<string, string[]>();
    for (const appointment of bookedAppointments) {
      const date = appointment.scheduled_date;
      const time = appointment.scheduled_time;

      if (!bookedMap.has(date)) {
        bookedMap.set(date, []);
      }

      bookedMap.get(date)!.push(time);
    }

    const result = monthDates.map(({ formattedDate, weekday }) => {
      const baseTimes = weeklyMap.get(weekday) ?? [];
      const dayOverrides = overridesMap.get(formattedDate) ?? [];
      const bookedTimes = bookedMap.get(formattedDate) ?? [];

      const hasBlockDay = dayOverrides.some(
        (override) => override.type === 'BLOCK_DAY'
      );

      let availableTimes = hasBlockDay ? [] : [...baseTimes];

      const removeTimes = dayOverrides
        .filter((override) => override.type === 'REMOVE' && override.time)
        .map((override) => override.time as string);

      const addTimes = dayOverrides
        .filter((override) => override.type === 'ADD' && override.time)
        .map((override) => override.time as string);

      availableTimes = availableTimes.filter(
        (time) => !removeTimes.includes(time)
      );

      availableTimes = [...availableTimes, ...addTimes];

      const uniqueAvailableTimes = [...new Set(availableTimes)].sort((a, b) =>
        a.localeCompare(b)
      );

      const realAvailableTimes = uniqueAvailableTimes.filter(
        (time) => !bookedTimes.includes(time)
      );

      return {
        date: formattedDate,
        has_availability: realAvailableTimes.length > 0,
        times: realAvailableTimes,
      };
    });

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