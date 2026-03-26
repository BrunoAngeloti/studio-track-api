import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';

type AdditionalServiceAttributes = {
  id: number;
  studio_id: string;
  name: string;
  price: number;
  description: string;
  estimated_time?: number;
  archived: boolean;
};

type AdditionalServiceCreationAttributes = Optional<
  AdditionalServiceAttributes,
  'id' | 'estimated_time'
>;

export class AdditionalService
  extends Model<
    AdditionalServiceAttributes,
    AdditionalServiceCreationAttributes
  >
  implements AdditionalServiceAttributes
{
  declare id: number;
  declare studio_id: string;
  declare name: string;
  declare description: string;
  declare price: number;
  declare estimated_time?: number;
  declare archived: boolean;

  static initModel(sequelize: Sequelize): typeof AdditionalService {
    return AdditionalService.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        studio_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },

        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },

        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        estimated_time: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        archived: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'additional_services',
        modelName: 'AdditionalService',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    AdditionalService.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });
  }
}