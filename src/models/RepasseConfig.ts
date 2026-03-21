import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';
import { Employee } from './Employee';

type RepasseConfigAttributes = {
  id: number;
  studio_id: string;

  name: string;

  responsible_employee_id: number;
  repasse_employee_id: number | null;
  repasse_percentage: number | null;

  is_default: boolean;
};

type RepasseConfigCreationAttributes = Optional<
  RepasseConfigAttributes,
  'id' | 'repasse_employee_id' | 'repasse_percentage'
>;

export class RepasseConfig
  extends Model<RepasseConfigAttributes, RepasseConfigCreationAttributes>
  implements RepasseConfigAttributes
{
  declare id: number;
  declare studio_id: string;

  declare name: string;

  declare responsible_employee_id: number;
  declare repasse_employee_id: number | null;
  declare repasse_percentage: number | null;

  declare is_default: boolean

  static initModel(sequelize: Sequelize): typeof RepasseConfig {
    return RepasseConfig.init(
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

        responsible_employee_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        repasse_employee_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        repasse_percentage: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: true,
        },

        is_default: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'repasse_configs',
        modelName: 'RepasseConfig',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    RepasseConfig.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });

    RepasseConfig.belongsTo(Employee, {
      foreignKey: 'responsible_employee_id',
      as: 'responsible_employee',
    });

    RepasseConfig.belongsTo(Employee, {
      foreignKey: 'repasse_employee_id',
      as: 'repasse_employee',
    });
  }
}