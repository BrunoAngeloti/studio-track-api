'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('studios', 'booking_horizon_months', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 12,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('studios', 'booking_horizon_months');
  },
};
