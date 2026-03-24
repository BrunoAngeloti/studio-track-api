import { Model, DataTypes, Sequelize } from 'sequelize';

export class AppointmentAdditionalService extends Model {
  declare appointment_id: number;
  declare additional_service_id: number;

  static initModel(sequelize: Sequelize): typeof AppointmentAdditionalService {
    return AppointmentAdditionalService.init(
      {
        appointment_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        additional_service_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
      },
      {
        sequelize,
        tableName: 'appointment_additional_services',
        modelName: 'AppointmentAdditionalService',
        timestamps: false,
        underscored: true,
      }
    );
  }
}