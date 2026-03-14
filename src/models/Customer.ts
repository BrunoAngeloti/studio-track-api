import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';
import { Transaction } from './Transaction';

type CustomerAttributes = {
  id: number;
  studio_id: string;
  name: string;
  phone?: string;
};

type CustomerCreationAttributes = Optional<CustomerAttributes, 'id' | 'phone'>;

export class Customer
  extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes
{
  declare id: number;
  declare studio_id: string;
  declare name: string;
  declare phone?: string;

  static initModel(sequelize: Sequelize): typeof Customer {
    return Customer.init(
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

        phone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'customers',
        modelName: 'Customer',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {

    Customer.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });

    Customer.hasMany(Transaction, {
      foreignKey: 'customer_id',
      as: 'transactions',
    });

  }
}