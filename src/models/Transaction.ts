import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';
import { Category } from './Category';
import { Customer } from './Customer';

type TransactionAttributes = {
  id: number;
  studio_id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date?: Date;
  category_id?: number;
  customer_id?: number;
  payment_method?: string;
  note?: string;
  vendor?: string;
};

type TransactionCreationAttributes = Optional<
  TransactionAttributes,
  'id' | 'date' | 'category_id' | 'customer_id' | 'payment_method' | 'note' | 'vendor'
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
  declare client?: string;
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
          type: DataTypes.INTEGER,
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
  }
}