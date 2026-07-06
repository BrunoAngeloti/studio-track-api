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
  booking_horizon_months: number;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  trial_ends_at?: Date | null;
  current_period_end?: Date | null;
  cancel_at_period_end: boolean;
  onboarding_completed: boolean;
  lifetime_free_access: boolean;
  password_reset_token_hash?: string | null;
  password_reset_expires_at?: Date | null;
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
  | 'booking_horizon_months'
  | 'stripe_customer_id'
  | 'stripe_subscription_id'
  | 'subscription_status'
  | 'trial_ends_at'
  | 'current_period_end'
  | 'cancel_at_period_end'
  | 'onboarding_completed'
  | 'lifetime_free_access'
  | 'password_reset_token_hash'
  | 'password_reset_expires_at'
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
  declare booking_horizon_months: number;
  declare stripe_customer_id?: string | null;
  declare stripe_subscription_id?: string | null;
  declare subscription_status?: string | null;
  declare trial_ends_at?: Date | null;
  declare current_period_end?: Date | null;
  declare cancel_at_period_end: boolean;
  declare onboarding_completed: boolean;
  declare lifetime_free_access: boolean;
  declare password_reset_token_hash?: string | null;
  declare password_reset_expires_at?: Date | null;
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

        booking_horizon_months: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 12,
          validate: {
            isIn: [[0, 1, 3, 6, 12]],
          },
        },

        stripe_customer_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        stripe_subscription_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        subscription_status: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        trial_ends_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        current_period_end: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        cancel_at_period_end: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        onboarding_completed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        lifetime_free_access: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },

        password_reset_token_hash: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        password_reset_expires_at: {
          type: DataTypes.DATE,
          allowNull: true,
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
