import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';

type EmployeeAttributes = {
  id: number;
  studio_id: string;
  name: string;
  role?: string;
  active?: boolean;
};

type EmployeeCreationAttributes = Optional<
  EmployeeAttributes,
  'id' | 'role' | 'active'
>;

export class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  declare id: number;
  declare studio_id: string;
  declare name: string;
  declare role?: string;
  declare active?: boolean;

  static initModel(sequelize: Sequelize): typeof Employee {
    return Employee.init(
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
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: 'employees',
        modelName: 'Employee',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    Employee.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });
  }
}