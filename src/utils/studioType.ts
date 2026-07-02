import { Studio } from '../models/Studio';
import { Employee } from '../models/Employee';

export class StudioTypeValidationError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Resolves the employee_id that should be persisted for a studio-scoped
 * record (service/transaction/appointment/availability row).
 *
 * - INDIVIDUAL studios: employee_id is always forced to null, regardless
 *   of what the client sent.
 * - TEAM studios: employee_id is required and must belong to the studio.
 */
export async function requireEmployeeIfTeam(
  studio_id: string,
  employee_id: number | null | undefined
): Promise<number | null> {
  const studio = await Studio.findByPk(studio_id);

  if (!studio) {
    throw new StudioTypeValidationError(404, 'Studio not found');
  }

  if (studio.type === 'INDIVIDUAL') {
    return null;
  }

  if (!employee_id) {
    throw new StudioTypeValidationError(400, 'employee_id is required for TEAM studios');
  }

  const employee = await Employee.findOne({
    where: { id: employee_id, studio_id },
  });

  if (!employee) {
    throw new StudioTypeValidationError(400, 'Invalid employee_id for this studio');
  }

  return employee_id;
}
