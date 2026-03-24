import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';

type AvailabilityOverrideType = 'ADD' | 'REMOVE' | 'BLOCK_DAY';

type AvailabilityOverrideAttributes = {
  id: number;
  studio_id: string;
  date: string;
  type: AvailabilityOverrideType;
  time?: string | null;
  reason?: string | null;
};

type AvailabilityOverrideCreationAttributes = Optional<
  AvailabilityOverrideAttributes,
  'id' | 'time' | 'reason'
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
  declare date: string;
  declare type: AvailabilityOverrideType;
  declare time?: string | null;
  declare reason?: string | null;

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

        date: {
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
      },
      {
        sequelize,
        tableName: 'availability_overrides',
        modelName: 'AvailabilityOverride',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['studio_id', 'date'],
          },
          {
            fields: ['studio_id', 'date', 'type'],
          },
          {
            unique: true,
            fields: ['studio_id', 'date', 'type', 'time'],
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
  }
}