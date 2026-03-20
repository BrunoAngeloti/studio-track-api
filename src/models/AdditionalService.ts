import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';

type AdditionalServiceAttributes = {
  id: number;
  studio_id: string;
  name: string;
  price: number;
  archived: boolean;
};

type AdditionalServiceCreationAttributes = Optional<
  AdditionalServiceAttributes,
  'id'
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
  declare price: number;
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