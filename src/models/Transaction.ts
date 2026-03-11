import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';
import { Category } from './Category';

type TransactionAttributes = {
  id: number;
  studio_id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date?: Date;
  category_id?: number;
  client?: string;
  payment_method?: string;
  note?: string;
};

type TransactionCreationAttributes = Optional<
  TransactionAttributes,
  'id' | 'date' | 'category_id' | 'client' | 'payment_method' | 'note'
>;

export class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  declare id: number;
  declare studio_id: number;
  declare type: 'INCOME' | 'EXPENSE';
  declare amount: number;
  declare date?: Date;
  declare category_id?: number;
  declare client?: string;
  declare payment_method?: string;
  declare note?: string;

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
        client: {
          type: DataTypes.STRING,
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
  }
}