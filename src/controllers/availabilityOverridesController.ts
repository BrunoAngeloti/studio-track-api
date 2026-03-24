import { Request, Response } from 'express';
import { AvailabilityOverride } from '../models/AvailabilityOverride';

function getStudioIdFromRequest(req: Request) {
  return (req as any).user?.studio_id as string | undefined;
}

export const createAvailabilityOverride = async (
  req: Request,
  res: Response
) => {
  try {
    const studio_id = getStudioIdFromRequest(req);

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { date, type, time, reason } = req.body;

    if (!date || !type) {
      return res.status(400).json({
        message: 'date and type are required',
      });
    }

    if (!['ADD', 'REMOVE', 'BLOCK_DAY'].includes(type)) {
      return res.status(400).json({
        message: 'type must be ADD, REMOVE or BLOCK_DAY',
      });
    }

    if ((type === 'ADD' || type === 'REMOVE') && !time) {
      return res.status(400).json({
        message: 'time is required when type is ADD or REMOVE',
      });
    }

    if (type === 'BLOCK_DAY' && time) {
      return res.status(400).json({
        message: 'time must not be sent when type is BLOCK_DAY',
      });
    }

    const existingOverride = await AvailabilityOverride.findOne({
      where: {
        studio_id,
        date,
        type,
        time: time ?? null,
      },
    });

    if (existingOverride) {
      return res.status(409).json({
        message: 'This override already exists',
      });
    }

    const override = await AvailabilityOverride.create({
      studio_id,
      date,
      type,
      time: time ?? null,
      reason: reason ?? null,
    });

    return res.status(201).json(override);
  } catch (error) {
    console.error('createAvailabilityOverride error:', error);
    return res.status(500).json({
      message: 'Error creating availability override',
    });
  }
};

export const getAvailabilityOverrides = async (
  req: Request,
  res: Response
) => {
  try {
    const studio_id = getStudioIdFromRequest(req);

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { page = '1', limit = '10', date, type } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);
    const offset = (pageNumber - 1) * limitNumber;

    const where: any = {
      studio_id,
    };

    if (typeof date === 'string' && date.trim()) {
      where.date = date;
    }

    if (typeof type === 'string' && type.trim()) {
      where.type = type;
    }

    const { count, rows } = await AvailabilityOverride.findAndCountAll({
      where,
      order: [
        ['date', 'DESC'],
        ['time', 'ASC'],
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
    console.error('getAvailabilityOverrides error:', error);
    return res.status(500).json({
      message: 'Error fetching availability overrides',
    });
  }
};

export const updateAvailabilityOverride = async (
  req: Request,
  res: Response
) => {
  try {
    const studio_id = getStudioIdFromRequest(req);

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;
    const { date, type, time, reason } = req.body;

    const override = await AvailabilityOverride.findOne({
      where: {
        id: Number(id),
        studio_id,
      },
    });

    if (!override) {
      return res.status(404).json({
        message: 'Availability override not found',
      });
    }

    const nextType = type ?? override.type;
    const nextDate = date ?? override.date;
    const nextTime = time !== undefined ? time : override.time;

    if (!['ADD', 'REMOVE', 'BLOCK_DAY'].includes(nextType)) {
      return res.status(400).json({
        message: 'type must be ADD, REMOVE or BLOCK_DAY',
      });
    }

    if ((nextType === 'ADD' || nextType === 'REMOVE') && !nextTime) {
      return res.status(400).json({
        message: 'time is required when type is ADD or REMOVE',
      });
    }

    if (nextType === 'BLOCK_DAY' && nextTime) {
      return res.status(400).json({
        message: 'time must be null when type is BLOCK_DAY',
      });
    }

    const duplicateOverride = await AvailabilityOverride.findOne({
      where: {
        studio_id,
        date: nextDate,
        type: nextType,
        time: nextTime ?? null,
      },
    });

    if (duplicateOverride && duplicateOverride.id !== override.id) {
      return res.status(409).json({
        message: 'Another override with the same data already exists',
      });
    }

    await override.update({
      date: nextDate,
      type: nextType,
      time: nextType === 'BLOCK_DAY' ? null : nextTime,
      reason: reason !== undefined ? reason : override.reason,
    });

    return res.status(200).json(override);
  } catch (error) {
    console.error('updateAvailabilityOverride error:', error);
    return res.status(500).json({
      message: 'Error updating availability override',
    });
  }
};

export const deleteAvailabilityOverride = async (
  req: Request,
  res: Response
) => {
  try {
    const studio_id = getStudioIdFromRequest(req);

    if (!studio_id) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;

    const override = await AvailabilityOverride.findOne({
      where: {
        id: Number(id),
        studio_id,
      },
    });

    if (!override) {
      return res.status(404).json({
        message: 'Availability override not found',
      });
    }

    await override.destroy();

    return res.status(200).json({
      message: 'Availability override deleted successfully',
    });
  } catch (error) {
    console.error('deleteAvailabilityOverride error:', error);
    return res.status(500).json({
      message: 'Error deleting availability override',
    });
  }
};