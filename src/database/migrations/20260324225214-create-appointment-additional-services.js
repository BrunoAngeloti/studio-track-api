'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointment_additional_services', {
      appointment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'appointments',
          key: 'id',
        },
        onDelete: 'CASCADE',
        primaryKey: true,
      },

      additional_service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'additional_services',
          key: 'id',
        },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('appointment_additional_services');
  },
};