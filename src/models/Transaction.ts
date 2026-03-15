import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';
import { Category } from './Category';
import { Customer } from './Customer';
import { Employee } from './Employee';

type TransactionAttributes = {
  id: number;
  studio_id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date?: Date;
  category_id?: number;
  customer_id?: number;

  responsible_employee_id?: number;
  repasse_employee_id?: number;
  repasse_percentage?: number;

  payment_method?: string;
  note?: string;
  vendor?: string;
};

type TransactionCreationAttributes = Optional<
  TransactionAttributes,
  | 'id'
  | 'date'
  | 'category_id'
  | 'customer_id'
  | 'responsible_employee_id'
  | 'repasse_employee_id'
  | 'repasse_percentage'
  | 'payment_method'
  | 'note'
  | 'vendor'
>;

export class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  declare id: number;
  declare studio_id: string;
  declare type: 'INCOME' | 'EXPENSE';
  declare amount: number;
  declare date?: Date;

  declare category_id?: number;
  declare customer_id?: number;

  declare responsible_employee_id?: number;
  declare repasse_employee_id?: number;
  declare repasse_percentage?: number;

  declare payment_method?: string;
  declare note?: string;
  declare vendor?: string;

  static initModel(sequelize: Sequelize): typeof Transaction {
    return Transaction.init(
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

        type: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isIn: [['INCOME', 'EXPENSE']],
          },
        },

        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },

        date: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        category_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        customer_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        responsible_employee_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        repasse_employee_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        repasse_percentage: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: true,
        },

        payment_method: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        note: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        vendor: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'transactions',
        modelName: 'Transaction',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    Transaction.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });

    Transaction.belongsTo(Category, {
      foreignKey: 'category_id',
      as: 'category',
    });

    Transaction.belongsTo(Customer, {
      foreignKey: 'customer_id',
      as: 'customer',
    });

    Transaction.belongsTo(Employee, {
      foreignKey: 'responsible_employee_id',
      as: 'responsible_employee',
    });

    Transaction.belongsTo(Employee, {
      foreignKey: 'repasse_employee_id',
      as: 'repasse_employee',
    });
  }
}