import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { AdditionalService } from '../models/AdditionalService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const addAdditionalServiceToAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const { appointment_id } = req.params;
    const { additional_service_id, studio_id } = req.body;

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    if (!appointment_id || !additional_service_id) {
      return res.status(400).json({
        message: 'appointment_id and additional_service_id are required',
      });
    }

    const appointment = await Appointment.findOne({
      where: {
        id: Number(appointment_id),
        studio_id,
      },
      include: [
        {
          model: AdditionalService,
          as: 'additional_services',
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
      });
    }

    const additionalService = await AdditionalService.findOne({
      where: {
        id: Number(additional_service_id),
        studio_id,
      } as any,
    });

    if (!additionalService) {
      return res.status(404).json({
        message: 'Additional service not found',
      });
    }

    const currentAdditionalServices =
      ((appointment as any).additional_services as AdditionalService[]) || [];

    const alreadyLinked = currentAdditionalServices.some(
      (item) => item.id === Number(additional_service_id)
    );

    if (alreadyLinked) {
      return res.status(409).json({
        message: 'Additional service is already linked to this appointment',
      });
    }

    await (appointment as any).addAdditional_service(additionalService);

    const updatedAppointment = await Appointment.findOne({
      where: {
        id: Number(appointment_id),
        studio_id,
      },
      include: [
        {
          model: AdditionalService,
          as: 'additional_services',
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    return res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('addAdditionalServiceToAppointment error:', error);
    return res.status(500).json({
      message: 'Error adding additional service to appointment',
    });
  }
};

export const removeAdditionalServiceFromAppointment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const studio_id = req.studio?.id;

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { appointment_id, additional_service_id } = req.params;

    if (!appointment_id || !additional_service_id) {
      return res.status(400).json({
        message: 'appointment_id and additional_service_id are required',
      });
    }

    const appointment = await Appointment.findOne({
      where: {
        id: Number(appointment_id),
        studio_id,
      },
      include: [
        {
          model: AdditionalService,
          as: 'additional_services',
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
      });
    }

    const additionalService = await AdditionalService.findOne({
      where: {
        id: Number(additional_service_id),
        studio_id,
      } as any,
    });

    if (!additionalService) {
      return res.status(404).json({
        message: 'Additional service not found',
      });
    }

    const currentAdditionalServices =
      ((appointment as any).additional_services as AdditionalService[]) || [];

    const isLinked = currentAdditionalServices.some(
      (item) => item.id === Number(additional_service_id)
    );

    if (!isLinked) {
      return res.status(404).json({
        message: 'Additional service is not linked to this appointment',
      });
    }

    await (appointment as any).removeAdditional_service(additionalService);

    const updatedAppointment = await Appointment.findOne({
      where: {
        id: Number(appointment_id),
        studio_id,
      },
      include: [
        {
          model: AdditionalService,
          as: 'additional_services',
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    return res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('removeAdditionalServiceFromAppointment error:', error);
    return res.status(500).json({
      message: 'Error removing additional service from appointment',
    });
  }
};