import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

type StudioAttributes = {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
};

type StudioCreationAttributes = Optional<StudioAttributes, 'id' | 'created_at' | 'updated_at'>;

export class Studio extends Model<StudioAttributes, StudioCreationAttributes>
  implements StudioAttributes
{
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare created_at?: Date;
  declare updated_at?: Date;

  static initModel(sequelize: Sequelize): typeof Studio {
    return Studio.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'studios',
        modelName: 'Studio',
        timestamps: true,
        underscored: true, // <-- isso alinha created_at/updated_at
      }
    );
  }
}