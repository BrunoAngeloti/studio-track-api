import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';
import { Customer } from './Customer';
import { Service } from './Service';
import { AdditionalService } from './AdditionalService';
import { Employee } from './Employee';

type AppointmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

type AppointmentAttributes = {
  id: number;
  studio_id: string;

  customer_id?: number | null;
  service_id?: number | null;
  responsible_employee_id?: number | null;

  scheduled_date: string;
  scheduled_time: string;

  requester_name: string;
  requester_phone: string;
  requester_phone_normalized: string;

  status: AppointmentStatus;

  note?: string | null;
  rejection_reason?: string | null;

  expires_at?: Date | null;
  approved_at?: Date | null;
  rejected_at?: Date | null;
  cancelled_at?: Date | null;
};

type AppointmentCreationAttributes = Optional<
  AppointmentAttributes,
  | 'id'
  | 'customer_id'
  | 'service_id'
  | 'responsible_employee_id'
  | 'note'
  | 'rejection_reason'
  | 'expires_at'
  | 'approved_at'
  | 'rejected_at'
  | 'cancelled_at'
>;

export class Appointment
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes
{
  declare id: number;
  declare studio_id: string;

  declare customer_id?: number | null;
  declare service_id?: number | null;
  declare responsible_employee_id?: number | null;

  declare scheduled_date: string;
  declare scheduled_time: string;

  declare requester_name: string;
  declare requester_phone: string;
  declare requester_phone_normalized: string;

  declare status: AppointmentStatus;

  declare note?: string | null;
  declare rejection_reason?: string | null;

  declare expires_at?: Date | null;
  declare approved_at?: Date | null;
  declare rejected_at?: Date | null;
  declare cancelled_at?: Date | null;

  static initModel(sequelize: Sequelize): typeof Appointment {
    return Appointment.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true,
        },

        studio_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },

        customer_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        service_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        responsible_employee_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        scheduled_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },

        scheduled_time: {
          type: DataTypes.TIME,
          allowNull: false,
        },

        requester_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        requester_phone: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        requester_phone_normalized: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'PENDING',
          validate: {
            isIn: [['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED']],
          },
        },

        note: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        rejection_reason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        expires_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        approved_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        rejected_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        cancelled_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'appointments',
        modelName: 'Appointment',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['studio_id'],
          },
          {
            fields: ['customer_id'],
          },
          {
            fields: ['service_id'],
          },
          {
            fields: ['responsible_employee_id'],
          },
          {
            fields: ['studio_id', 'scheduled_date', 'scheduled_time'],
          },
          {
            fields: ['studio_id', 'status'],
          },
          {
            fields: ['studio_id', 'requester_phone_normalized'],
          },
        ],
      }
    );
  }

  static associate() {
    Appointment.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });

    Appointment.belongsTo(Customer, {
      foreignKey: 'customer_id',
      as: 'customer',
    });

    Appointment.belongsTo(Service, {
      foreignKey: 'service_id',
      as: 'service',
    });

    Appointment.belongsTo(Employee, {
      foreignKey: 'responsible_employee_id',
      as: 'responsible_employee',
    });

    Appointment.belongsToMany(AdditionalService, {
      through: 'appointment_additional_services',
      foreignKey: 'appointment_id',
      otherKey: 'additional_service_id',
      as: 'additional_services',
    });
  }
}