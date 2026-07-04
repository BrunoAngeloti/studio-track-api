'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('studios', 'current_period_end', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('studios', 'cancel_at_period_end', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('studios', 'current_period_end');
    await queryInterface.removeColumn('studios', 'cancel_at_period_end');
  },
};
