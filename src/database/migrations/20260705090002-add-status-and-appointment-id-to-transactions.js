'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'CONFIRMED',
    });

    await queryInterface.addColumn('transactions', 'appointment_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'appointments',
        key: 'id',
      },
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('transactions', {
      fields: ['appointment_id'],
      type: 'unique',
      name: 'transactions_appointment_id_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('transactions', 'transactions_appointment_id_unique');
    await queryInterface.removeColumn('transactions', 'appointment_id');
    await queryInterface.removeColumn('transactions', 'status');
  },
};
