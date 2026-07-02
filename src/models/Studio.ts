import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Category } from './Category';

type StudioAttributes = {
  id: string;
  name: string;
  email: string;
  password: string;
  username?: string;
  phone?: string;
  instagram?: string;
  catalog_link?: string;
  primary_color?: string;
  secondary_color?: string;
  type: 'INDIVIDUAL' | 'TEAM';
  created_at?: Date;
  updated_at?: Date;
};

type StudioCreationAttributes = Optional<
  StudioAttributes,
  | 'id'
  | 'username'
  | 'phone'
  | 'instagram'
  | 'catalog_link'
  | 'primary_color'
  | 'secondary_color'
  | 'type'
  | 'created_at'
  | 'updated_at'
>;

export class Studio
  extends Model<StudioAttributes, StudioCreationAttributes>
  implements StudioAttributes
{
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare username?: string;
  declare phone?: string;
  declare primary_color?: string;
  declare secondary_color?: string;
  declare type: 'INDIVIDUAL' | 'TEAM';
  declare created_at?: Date;
  declare updated_at?: Date;
  declare instagram?: string;
  declare catalog_link?: string;

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

        username: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },

        phone: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        instagram: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        catalog_link: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        primary_color: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        secondary_color: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        type: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'INDIVIDUAL',
          validate: {
            isIn: [['INDIVIDUAL', 'TEAM']],
          },
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
        underscored: true,
      }
    );
  }

  static associate() {
    Studio.hasMany(Category, {
      foreignKey: 'studio_id',
      as: 'categories',
    });
  }
}