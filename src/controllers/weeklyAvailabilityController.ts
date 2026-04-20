import { Response } from 'express';
import { WeeklyAvailability } from '../models/WeeklyAvailability';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const createWeeklyAvailability = async (
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

    const { weekday, time, is_active } = req.body;

    if (weekday === undefined || !time) {
      return res.status(400).json({
        message: 'weekday and time are required',
      });
    }

    const weekdayNumber = Number(weekday);

    if (Number.isNaN(weekdayNumber) || weekdayNumber < 0 || weekdayNumber > 6) {
      return res.status(400).json({
        message: 'weekday must be a number between 0 and 6',
      });
    }

    const existingWeeklyAvailability = await WeeklyAvailability.findOne({
      where: {
        studio_id,
        weekday: weekdayNumber,
        time,
      },
    });

    if (existingWeeklyAvailability) {
      return res.status(409).json({
        message: 'This weekly availability already exists',
      });
    }

    const weeklyAvailability = await WeeklyAvailability.create({
      studio_id,
      weekday: weekdayNumber,
      time,
      is_active: is_active ?? true,
    });

    return res.status(201).json(weeklyAvailability);
  } catch (error) {
    console.error('createWeeklyAvailability error:', error);
    return res.status(500).json({
      message: 'Error creating weekly availability',
    });
  }
};

export const getWeeklyAvailabilities = async (
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

    const { weekday } = req.query;

    const where: any = {
      studio_id,
    };

    if (typeof weekday === 'string' && weekday.trim()) {
      const weekdayNumber = Number(weekday);

      if (Number.isNaN(weekdayNumber) || weekdayNumber < 0 || weekdayNumber > 6) {
        return res.status(400).json({
          message: 'weekday must be a number between 0 and 6',
        });
      }

      where.weekday = weekdayNumber;
    }

    const rows = await WeeklyAvailability.findAll({
      where,
      order: [
        ['weekday', 'ASC'],
        ['time', 'ASC'],
        ['created_at', 'DESC'],
      ],
    });

    return res.status(200).json({
      data: rows,
    });
  } catch (error) {
    console.error('getWeeklyAvailabilities error:', error);
    return res.status(500).json({
      message: 'Error fetching weekly availabilities',
    });
  }
};

export const updateWeeklyAvailability = async (
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

    const { id } = req.params;
    const { weekday, time, is_active } = req.body;

    const weeklyAvailability = await WeeklyAvailability.findOne({
      where: {
        id: Number(id),
        studio_id,
      },
    });

    if (!weeklyAvailability) {
      return res.status(404).json({
        message: 'Weekly availability not found',
      });
    }

    const nextWeekday =
      weekday !== undefined ? Number(weekday) : weeklyAvailability.weekday;
    const nextTime = time ?? weeklyAvailability.time;

    if (Number.isNaN(nextWeekday) || nextWeekday < 0 || nextWeekday > 6) {
      return res.status(400).json({
        message: 'weekday must be a number between 0 and 6',
      });
    }

    const duplicateWeeklyAvailability = await WeeklyAvailability.findOne({
      where: {
        studio_id,
        weekday: nextWeekday,
        time: nextTime,
      },
    });

    if (
      duplicateWeeklyAvailability &&
      duplicateWeeklyAvailability.id !== weeklyAvailability.id
    ) {
      return res.status(409).json({
        message: 'Another weekly availability with the same weekday and time already exists',
      });
    }

    await weeklyAvailability.update({
      weekday: nextWeekday,
      time: nextTime,
      is_active:
        is_active !== undefined ? is_active : weeklyAvailability.is_active,
    });

    return res.status(200).json(weeklyAvailability);
  } catch (error) {
    console.error('updateWeeklyAvailability error:', error);
    return res.status(500).json({
      message: 'Error updating weekly availability',
    });
  }
};

export const deleteWeeklyAvailability = async (
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

    const { id } = req.params;

    const weeklyAvailability = await WeeklyAvailability.findOne({
      where: {
        id: Number(id),
        studio_id,
      },
    });

    if (!weeklyAvailability) {
      return res.status(404).json({
        message: 'Weekly availability not found',
      });
    }

    await weeklyAvailability.destroy();

    return res.status(200).json({
      message: 'Weekly availability deleted successfully',
    });
  } catch (error) {
    console.error('deleteWeeklyAvailability error:', error);
    return res.status(500).json({
      message: 'Error deleting weekly availability',
    });
  }
};