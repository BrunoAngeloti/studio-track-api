import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Studio } from './Studio';

type PushSubscriptionAttributes = {
  id: number;
  studio_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

type PushSubscriptionCreationAttributes = Optional<PushSubscriptionAttributes, 'id'>;

export class PushSubscription
  extends Model<PushSubscriptionAttributes, PushSubscriptionCreationAttributes>
  implements PushSubscriptionAttributes
{
  declare id: number;
  declare studio_id: string;
  declare endpoint: string;
  declare p256dh: string;
  declare auth: string;

  static initModel(sequelize: Sequelize): typeof PushSubscription {
    return PushSubscription.init(
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
        endpoint: {
          type: DataTypes.TEXT,
          allowNull: false,
          unique: true,
        },
        p256dh: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        auth: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'push_subscriptions',
        modelName: 'PushSubscription',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static associate() {
    PushSubscription.belongsTo(Studio, {
      foreignKey: 'studio_id',
      as: 'studio',
    });
  }
}
