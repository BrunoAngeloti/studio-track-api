import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';

type CategoryAttributes = {
  id: number;
  studio_id: string;
  name: string;
  color?: string;
};

type CategoryCreationAttributes = Optional<CategoryAttributes, 'id' | 'color'>;

export class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  declare id: number;
  declare studio_id: string;
  declare name: string;
  declare color?: string;

  static initModel(sequelize: Sequelize): typeof Category {
    return Category.init(
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
        color: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'categories',
        modelName: 'Category',
        timestamps: false,
        underscored: true,
      }
    );
  }

  static associate() {
    Category.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });
  }
}