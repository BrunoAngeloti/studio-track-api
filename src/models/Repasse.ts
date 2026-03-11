import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';

type RepasseAttributes = {
  id: number;
  studio_id: string;
  person_name: string;
  percentage: number;
  created_at?: Date;
  updated_at?: Date;
};

type RepasseCreationAttributes = Optional<
  RepasseAttributes,
  'id' | 'created_at' | 'updated_at'
>;

export class Repasse
  extends Model<RepasseAttributes, RepasseCreationAttributes>
  implements RepasseAttributes
{
  declare id: number;
  declare studio_id: string;
  declare person_name: string;
  declare percentage: number;
  declare created_at?: Date;
  declare updated_at?: Date;

  static initModel(sequelize: Sequelize): typeof Repasse {
    return Repasse.init(
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
        person_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        percentage: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'repasses',
        modelName: 'Repasse',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    Repasse.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });
  }
}