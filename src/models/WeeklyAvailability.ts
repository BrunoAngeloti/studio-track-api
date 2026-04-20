import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';

type WeeklyAvailabilityAttributes = {
  id: number;
  studio_id: string;
  weekday: number; // 0=domingo, 1=segunda ... 6=sábado
  time: string;
  is_active: boolean;
};

type WeeklyAvailabilityCreationAttributes = Optional<
  WeeklyAvailabilityAttributes,
  'id' | 'is_active'
>;

export class WeeklyAvailability
  extends Model<
    WeeklyAvailabilityAttributes,
    WeeklyAvailabilityCreationAttributes
  >
  implements WeeklyAvailabilityAttributes
{
  declare id: number;
  declare studio_id: string;
  declare weekday: number;
  declare time: string;
  declare is_active: boolean;

  static initModel(sequelize: Sequelize): typeof WeeklyAvailability {
    return WeeklyAvailability.init(
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

        weekday: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 0,
            max: 6,
          },
        },

        time: {
          type: DataTypes.TIME,
          allowNull: false,
        },

        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: 'weekly_availabilities',
        modelName: 'WeeklyAvailability',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['studio_id', 'weekday'],
          },
          {
            unique: true,
            fields: ['studio_id', 'weekday', 'time'],
          },
        ],
      }
    );
  }

  static associate() {
    WeeklyAvailability.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });
  }
}