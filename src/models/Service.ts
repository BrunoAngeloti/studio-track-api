import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';
import { AdditionalService } from './AdditionalService';
import { Employee } from './Employee';

type ServiceAttributes = {
  id: number;
  studio_id: string;
  name: string;
  description?: string;
  price: number;
  estimated_time?: number;
  archived: boolean;
  employee_id?: number | null;
};

type ServiceCreationAttributes = Optional<
  ServiceAttributes,
  'id' | 'description' | 'estimated_time' | 'employee_id'
>;

export class Service
  extends Model<ServiceAttributes, ServiceCreationAttributes>
  implements ServiceAttributes
{
  declare id: number;
  declare studio_id: string;
  declare name: string;
  declare description?: string;
  declare price: number;
  declare estimated_time?: number;
  declare archived: boolean;
  declare employee_id?: number | null;

  static initModel(sequelize: Sequelize): typeof Service {
    return Service.init(
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

        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
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

        employee_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'services',
        modelName: 'Service',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    Service.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });

    Service.belongsTo(Employee, {
      foreignKey: 'employee_id',
      as: 'employee',
    });
  }
}