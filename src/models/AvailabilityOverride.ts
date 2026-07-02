import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';
import { Employee } from './Employee';

type AvailabilityOverrideType = 'ADD' | 'REMOVE' | 'BLOCK_DAY';

type AvailabilityOverrideAttributes = {
  id: number;
  studio_id: string;
  start_date: string;
  end_date: string;
  type: AvailabilityOverrideType;
  time?: string | null;
  reason?: string | null;
  employee_id?: number | null;
};

type AvailabilityOverrideCreationAttributes = Optional<
  AvailabilityOverrideAttributes,
  'id' | 'time' | 'reason' | 'employee_id'
>;

export class AvailabilityOverride
  extends Model<
    AvailabilityOverrideAttributes,
    AvailabilityOverrideCreationAttributes
  >
  implements AvailabilityOverrideAttributes
{
  declare id: number;
  declare studio_id: string;
  declare start_date: string;
  declare end_date: string;
  declare type: AvailabilityOverrideType;
  declare time?: string | null;
  declare reason?: string | null;
  declare employee_id?: number | null;

  static initModel(sequelize: Sequelize): typeof AvailabilityOverride {
    return AvailabilityOverride.init(
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

        start_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },

        end_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },

        type: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isIn: [['ADD', 'REMOVE', 'BLOCK_DAY']],
          },
        },

        time: {
          type: DataTypes.TIME,
          allowNull: true,
        },

        reason: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        employee_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'availability_overrides',
        modelName: 'AvailabilityOverride',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            name: 'availability_overrides_studio_range_idx',
            fields: ['studio_id', 'start_date', 'end_date'],
          },
          {
            name: 'availability_overrides_employee_range_idx',
            fields: ['studio_id', 'employee_id', 'start_date', 'end_date'],
          },
        ],
      }
    );
  }

  static associate() {
    AvailabilityOverride.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });

    AvailabilityOverride.belongsTo(Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });
  }
}
